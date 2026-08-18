import { z } from "zod";
import { APPLICATION_STATUSES, WORK_MODES } from "./constants";

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
  nextStepAt: z.string().optional(),
  notes: z.string().trim().max(3000, "Notes must be under 3,000 characters.").optional(),
});

// I use this small object to send simple form errors back to the page.
export type ApplicationActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export const EMPTY_ACTION_STATE: ApplicationActionState = {};
