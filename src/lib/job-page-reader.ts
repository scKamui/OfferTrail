import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_REDIRECTS = 4;
const MAX_PAGE_BYTES = 2_000_000;
const REQUEST_TIMEOUT_MS = 10_000;

export class JobPageError extends Error {
  constructor(
    message: string,
    public readonly status = 422,
  ) {
    super(message);
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];

  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.slice("::ffff:".length));
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

// I export this small check so its security rules can be tested without making network requests.
export function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

async function validatePublicUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new JobPageError("Enter a complete job link that starts with http:// or https://.", 400);
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new JobPageError("Only normal public http:// or https:// job links can be imported.", 400);
  }

  if ((url.port && url.port !== "80" && url.port !== "443") || /(?:^|\.)(localhost|local|internal)$/i.test(url.hostname)) {
    throw new JobPageError("That address cannot be imported.", 400);
  }

  try {
    // I check every resolved address so the importer cannot be used to reach private services.
    const addresses = await lookup(url.hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
      throw new JobPageError("That address cannot be imported.", 400);
    }
  } catch (error) {
    if (error instanceof JobPageError) throw error;
    throw new JobPageError("OfferTrail could not find that website. Check the link and try again.");
  }

  return url;
}

async function readLimitedBody(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_PAGE_BYTES) {
    throw new JobPageError("That job page is too large to import safely.");
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    bytesRead += value.byteLength;
    if (bytesRead > MAX_PAGE_BYTES) {
      await reader.cancel();
      throw new JobPageError("That job page is too large to import safely.");
    }

    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
}

// I validate each redirect because the destination can be different from the pasted link.
export async function readPublicJobPage(value: string) {
  let currentUrl = await validatePublicUrl(value);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    let response: Response;

    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "OfferTrail Job Importer/1.0",
        },
      });
    } catch {
      throw new JobPageError("The job website did not respond. You can still enter the details manually.");
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new JobPageError("The job page redirected too many times.");
      }

      currentUrl = await validatePublicUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) {
      throw new JobPageError(
        "That website would not allow OfferTrail to read the job. You can still enter it manually.",
      );
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new JobPageError("That link does not appear to be a job webpage.");
    }

    return readLimitedBody(response);
  }

  throw new JobPageError("The job page could not be imported.");
}
