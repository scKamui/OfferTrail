import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDatabase } from "@/db";
import { applications, applicationUpdates } from "@/db/schema";
import type { ApplicationStatus } from "./constants";

type ApplicationFilters = {
  query?: string;
  status?: ApplicationStatus;
};

// I read the data on the server so the database password never reaches the browser.
export async function getApplications(
  clerkUserId: string,
  filters: ApplicationFilters = {},
) {
  const conditions = [eq(applications.clerkUserId, clerkUserId)];

  if (filters.status) {
    conditions.push(eq(applications.status, filters.status));
  }

  if (filters.query) {
    const search = `%${filters.query}%`;
    const textMatch = or(
      ilike(applications.company, search),
      ilike(applications.position, search),
    );

    if (textMatch) conditions.push(textMatch);
  }

  return getDatabase()
    .select()
    .from(applications)
    .where(and(...conditions))
    .orderBy(desc(applications.updatedAt));
}

// I also check the user ID so someone cannot open another user's application.
export async function getApplication(clerkUserId: string, id: string) {
  const [application] = await getDatabase()
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.clerkUserId, clerkUserId)))
    .limit(1);

  return application;
}

// I load an application's full history with the newest update first.
export async function getApplicationUpdates(clerkUserId: string, applicationId: string) {
  return getDatabase()
    .select()
    .from(applicationUpdates)
    .where(
      and(
        eq(applicationUpdates.clerkUserId, clerkUserId),
        eq(applicationUpdates.applicationId, applicationId),
      ),
    )
    .orderBy(desc(applicationUpdates.updateDate), desc(applicationUpdates.createdAt));
}

// I join updates to their applications so the calendar has the company and role names.
export async function getProgressUpdates(clerkUserId: string) {
  return getDatabase()
    .select({
      id: applicationUpdates.id,
      applicationId: applicationUpdates.applicationId,
      company: applications.company,
      position: applications.position,
      description: applicationUpdates.description,
      type: applicationUpdates.type,
      updateDate: applicationUpdates.updateDate,
    })
    .from(applicationUpdates)
    .innerJoin(applications, eq(applicationUpdates.applicationId, applications.id))
    .where(
      and(
        eq(applicationUpdates.clerkUserId, clerkUserId),
        eq(applications.clerkUserId, clerkUserId),
      ),
    )
    .orderBy(desc(applicationUpdates.updateDate), desc(applicationUpdates.createdAt));
}
