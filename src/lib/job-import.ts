import * as cheerio from "cheerio";
import type { WorkMode } from "./constants";

// I keep the imported fields in one type so the server and form always agree.
export type ImportedJobDetails = {
  company?: string;
  position?: string;
  location?: string;
  workMode?: WorkMode;
  salaryRange?: string;
  jobDescription?: string;
  applicationDeadline?: string;
};

type JsonRecord = Record<string, unknown>;

const MAX_DESCRIPTION_LENGTH = 12_000;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return undefined;

  // I turn HTML descriptions into readable plain text before putting them in the form.
  const text = cheerio.load(`<main>${value}</main>`)("main")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return text ? text.slice(0, maxLength) : undefined;
}

function readType(value: unknown) {
  const types = Array.isArray(value) ? value : [value];
  return types.some(
    (type) => typeof type === "string" && type.toLowerCase() === "jobposting",
  );
}

function findJobPosting(value: unknown): JsonRecord | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const job = findJobPosting(item);
      if (job) return job;
    }
  }

  if (!isRecord(value)) return undefined;
  if (readType(value["@type"])) return value;

  // I also search @graph because many sites group their structured data there.
  for (const child of Object.values(value)) {
    const job = findJobPosting(child);
    if (job) return job;
  }

  return undefined;
}

function readOrganizationName(value: unknown) {
  if (!isRecord(value)) return undefined;
  return cleanText(value.name, 120);
}

function formatAddress(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const locations = value.map(formatAddress).filter(Boolean);
    return locations.length ? [...new Set(locations)].join("; ").slice(0, 120) : undefined;
  }

  if (typeof value === "string") return cleanText(value, 120);
  if (!isRecord(value)) return undefined;

  const namedLocation = cleanText(value.name, 120);
  if (namedLocation) return namedLocation;

  const address = isRecord(value.address) ? value.address : value;
  const parts = [
    address.addressLocality,
    address.addressRegion,
    address.addressCountry,
  ]
    .map((part) => cleanText(part, 80))
    .filter(Boolean);

  return parts.length ? [...new Set(parts)].join(", ").slice(0, 120) : undefined;
}

function readLocation(job: JsonRecord) {
  const locations = Array.isArray(job.jobLocation) ? job.jobLocation : [job.jobLocation];

  for (const location of locations) {
    const formatted = formatAddress(location);
    if (formatted) return formatted;
  }

  return formatAddress(job.applicantLocationRequirements);
}

function readWorkMode(job: JsonRecord, description?: string): WorkMode | undefined {
  const locationType = cleanText(job.jobLocationType, 80)?.toLowerCase();
  const combined = `${locationType ?? ""} ${description ?? ""}`.toLowerCase();

  if (locationType?.includes("telecommute") || /\b(remote|work from home)\b/.test(combined)) {
    return "remote";
  }

  if (/\bhybrid\b/.test(combined)) return "hybrid";
  if (job.jobLocation) return "onsite";
  return undefined;
}

function readMoney(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  if (!isRecord(value)) return undefined;

  const min = value.minValue;
  const max = value.maxValue;
  const exact = value.value;

  if (min !== undefined && max !== undefined) return `${min}–${max}`;
  if (exact !== undefined) return String(exact);
  return undefined;
}

function readSalary(value: unknown) {
  if (!isRecord(value)) return cleanText(value, 160);

  const currency = cleanText(value.currency, 10);
  const nestedValue = isRecord(value.value) ? value.value : value;
  const amount = readMoney(nestedValue);
  const unit = cleanText(nestedValue.unitText, 30)?.toLowerCase();

  if (!amount) return undefined;
  return [currency, amount, unit ? `per ${unit}` : undefined].filter(Boolean).join(" ");
}

function readDate(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0];
}

function readMeta($: cheerio.CheerioAPI, names: string[]) {
  for (const name of names) {
    const value = $(`meta[property="${name}"], meta[name="${name}"]`).attr("content");
    const cleaned = cleanText(value);
    if (cleaned) return cleaned;
  }

  return undefined;
}

function splitTitle(value?: string) {
  if (!value) return {};

  // I only split familiar title patterns so I do not guess at unrelated page titles.
  const patterns = [
    /^Job Application for (.*?) at (.+)$/i,
    /^(.*?)\s+at\s+(.+?)(?:\s+[|–—-]\s+.*)?$/i,
    /^(.*?)\s+\|\s+(.+?)$/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      return {
        position: cleanText(match[1], 120),
        company: cleanText(match[2], 120),
      };
    }
  }

  return { position: cleanText(value, 120) };
}

function readFallbackWorkMode(location?: string, description?: string) {
  const locationText = location?.toLowerCase() ?? "";
  const descriptionText = description?.toLowerCase() ?? "";

  // I trust the job's location label before scanning the full description for stray words.
  if (/\bhybrid\b/.test(locationText)) return "hybrid";
  if (/\b(remote|work from home)\b/.test(locationText)) return "remote";
  if (/\bhybrid\b/.test(descriptionText)) return "hybrid";
  if (/\b(remote|work from home)\b/.test(descriptionText)) return "remote";

  return location ? "onsite" : undefined;
}

function readFallbackSalary($: cheerio.CheerioAPI) {
  const salarySection = cleanText($("[data-qa='salary-range']").first().text(), 2_000);
  if (!salarySection) return undefined;

  // I keep just the useful pay ranges instead of copying the paragraph around them.
  const ranges = salarySection.match(
    /(?:CAD|USD|EUR|GBP)\s*\$?[\d,.]+\s*[-–—]\s*\$?[\d,.]+(?:\s*(?:annually|yearly|per\s+(?:year|hour)))?/gi,
  );

  return cleanText(ranges?.join("; ") || salarySection, 160);
}

function extractFallbackDetails($: cheerio.CheerioAPI): ImportedJobDetails {
  const socialTitle = readMeta($, ["og:title", "twitter:title"]);
  const documentTitle = cleanText($("title").text());
  const titleParts = splitTitle(documentTitle || socialTitle);

  const position =
    cleanText($("h1").first().text(), 120) ||
    cleanText($("[data-automation='job-detail-title']").first().text(), 120) ||
    socialTitle ||
    titleParts.position;

  const company =
    cleanText($("[data-automation='job-detail-company']").first().text(), 120) ||
    cleanText($(".posting-categories .sort-by-team").first().text(), 120) ||
    titleParts.company;

  const location =
    cleanText($(".job__location").first().text(), 120) ||
    cleanText($("[data-automation='job-detail-location']").first().text(), 120) ||
    cleanText($(".posting-categories .sort-by-location").first().text(), 120);

  const jobDescription =
    cleanText($(".job__description .posting-requirements").first().text(), MAX_DESCRIPTION_LENGTH) ||
    cleanText($("[data-qa='job-description']").first().text(), MAX_DESCRIPTION_LENGTH) ||
    cleanText($(".job__description").first().text(), MAX_DESCRIPTION_LENGTH) ||
    readMeta($, ["description", "og:description"]);

  return {
    company,
    position,
    location,
    workMode: readFallbackWorkMode(location, jobDescription),
    salaryRange: readFallbackSalary($),
    jobDescription,
  };
}

// I prefer JobPosting JSON-LD because it is the most accurate information a job page provides.
export function extractJobDetails(html: string): ImportedJobDetails {
  const $ = cheerio.load(html);
  let job: JsonRecord | undefined;

  $("script[type='application/ld+json']").each((_, element) => {
    if (job) return;

    try {
      job = findJobPosting(JSON.parse($(element).text()));
    } catch {
      // I ignore one broken JSON block because another block may still contain the job.
    }
  });

  if (!job) return extractFallbackDetails($);

  const jobDescription = cleanText(job.description, MAX_DESCRIPTION_LENGTH);

  return {
    company: readOrganizationName(job.hiringOrganization),
    position: cleanText(job.title, 120),
    location: readLocation(job),
    workMode: readWorkMode(job, jobDescription),
    salaryRange: readSalary(job.baseSalary),
    jobDescription,
    applicationDeadline: readDate(job.validThrough),
  };
}
