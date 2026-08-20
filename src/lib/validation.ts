import { z } from "zod";
import { APPLICATION_STATUSES, PROGRESS_UPDATE_TYPES, WORK_MODES } from "./constants";

// I check the form again on the server because browser checks can be bypassed.
export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required.").max(120),
  position: z.string().trim().min(1, "Position is required.").max(120),
  location: z.string().trim().max(120).optional(),
  jobUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Use a full http:// or https:// link.",
    )
    .optional(),
  status: z.enum(APPLICATION_STATUSES),
  workMode: z.enum(WORK_MODES),
  appliedAt: z.string().optional(),
  notes: z.string().trim().max(3000, "Notes must be under 3,000 characters.").optional(),
});

export const progressUpdateSchema = z
  .object({
    type: z.enum(PROGRESS_UPDATE_TYPES),
    description: z.string().trim().max(160, "Description must be under 160 characters."),
    updateDate: z.string().min(1, "Date is required."),
    notes: z.string().trim().max(1000, "Notes must be under 1,000 characters.").optional(),
  })
  .refine((data) => data.type !== "custom" || data.description.length > 0, {
    message: "Add a short description for a custom update.",
    path: ["description"],
  });

// I use this small object to send simple form errors back to the page.
export type ApplicationActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export const EMPTY_ACTION_STATE: ApplicationActionState = {};
