"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDatabase } from "@/db";
import { applications } from "@/db/schema";
import {
  applicationSchema,
  type ApplicationActionState,
} from "@/lib/validation";

// I turn the submitted form into a regular object so Zod can check it.
function readApplicationForm(formData: FormData) {
  return {
    company: String(formData.get("company") ?? ""),
    position: String(formData.get("position") ?? ""),
    location: String(formData.get("location") ?? ""),
    jobUrl: String(formData.get("jobUrl") ?? ""),
    status: String(formData.get("status") ?? "applied"),
    workMode: String(formData.get("workMode") ?? "remote"),
    appliedAt: String(formData.get("appliedAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

// I save empty optional fields as null to keep the database clean.
function toDatabaseValues(data: ReturnType<typeof applicationSchema.parse>) {
  return {
    company: data.company,
    position: data.position,
    location: data.location || null,
    jobUrl: data.jobUrl || null,
    status: data.status,
    workMode: data.workMode,
    appliedAt: data.appliedAt || null,
    notes: data.notes || null,
    updatedAt: new Date(),
  };
}

// I check Clerk inside every action so only a signed-in user can change data.
async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("You must be signed in to change applications.");
  }

  return userId;
}

export async function createApplication(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const userId = await requireUserId();
  const result = applicationSchema.safeParse(readApplicationForm(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await getDatabase().insert(applications).values({
      clerkUserId: userId,
      ...toDatabaseValues(result.data),
    });
  } catch (error) {
    console.error("Could not create application", error);
    return { message: "The application could not be saved. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateApplication(
  id: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const userId = await requireUserId();
  const result = applicationSchema.safeParse(readApplicationForm(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    await getDatabase()
      .update(applications)
      .set(toDatabaseValues(result.data))
      .where(and(eq(applications.id, id), eq(applications.clerkUserId, userId)));
  } catch (error) {
    console.error("Could not update application", error);
    return { message: "The changes could not be saved. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteApplication(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");

  // I match both IDs so a user can only delete their own application.
  await getDatabase()
    .delete(applications)
    .where(and(eq(applications.id, id), eq(applications.clerkUserId, userId)));

  revalidatePath("/dashboard");
}
