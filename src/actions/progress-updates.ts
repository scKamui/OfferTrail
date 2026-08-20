"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/db";
import { applications, applicationUpdates } from "@/db/schema";
import {
  PROGRESS_UPDATE_LABELS,
  type ApplicationStatus,
  type ProgressUpdateType,
} from "@/lib/constants";
import {
  progressUpdateSchema,
  type ApplicationActionState,
} from "@/lib/validation";

// I only change the main status when an update represents a real application stage.
const STATUS_FOR_UPDATE: Partial<Record<ProgressUpdateType, ApplicationStatus>> = {
  screening: "screening",
  interview: "interview",
  offer: "offer",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

function readProgressUpdateForm(formData: FormData) {
  return {
    type: String(formData.get("type") ?? ""),
    description: String(formData.get("description") ?? ""),
    updateDate: String(formData.get("updateDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function addProgressUpdate(
  applicationId: string,
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { message: "You must be signed in to add a progress update." };
  }

  const result = progressUpdateSchema.safeParse(readProgressUpdateForm(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const database = getDatabase();
  const [application] = await database
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.clerkUserId, userId)))
    .limit(1);

  if (!application) {
    return { message: "This application could not be found." };
  }

  const description = result.data.description || PROGRESS_UPDATE_LABELS[result.data.type];

  try {
    await database.insert(applicationUpdates).values({
      applicationId,
      clerkUserId: userId,
      type: result.data.type,
      description,
      updateDate: result.data.updateDate,
      notes: result.data.notes || null,
    });

    const nextStatus = STATUS_FOR_UPDATE[result.data.type];

    if (nextStatus) {
      await database
        .update(applications)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(and(eq(applications.id, applicationId), eq(applications.clerkUserId, userId)));
    }
  } catch (error) {
    console.error("Could not add progress update", error);
    return { message: "The progress update could not be saved. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${applicationId}/edit`);
  return { message: "Progress update added.", success: true };
}
