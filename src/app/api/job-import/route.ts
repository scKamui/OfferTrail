import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { extractJobDetails } from "@/lib/job-import";
import { JobPageError, readPublicJobPage } from "@/lib/job-page-reader";

const requestSchema = z.object({
  url: z.string().trim().min(1).max(2_000),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  // I require a signed-in account so this endpoint is only used by OfferTrail users.
  if (!userId) {
    return Response.json({ message: "Sign in before importing a job." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "The import request was not valid." }, { status: 400 });
  }

  const result = requestSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: "Enter a complete job posting link." }, { status: 400 });
  }

  try {
    const html = await readPublicJobPage(result.data.url);
    const details = extractJobDetails(html);
    const importedCount = Object.values(details).filter(Boolean).length;

    if (!importedCount) {
      throw new JobPageError(
        "OfferTrail reached the page but could not recognize its job details. You can still enter them manually.",
      );
    }

    return Response.json({ details, importedCount });
  } catch (error) {
    if (error instanceof JobPageError) {
      return Response.json({ message: error.message }, { status: error.status });
    }

    console.error("Could not import job page", error);
    return Response.json(
      { message: "The job could not be imported right now. You can still enter it manually." },
      { status: 500 },
    );
  }
}
