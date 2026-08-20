import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDatabase } from "@/db";
import { applications } from "@/db/schema";
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
