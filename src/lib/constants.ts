// I keep shared choices here so the form, filters, and database stay matched.
export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type WorkMode = (typeof WORK_MODES)[number];

// I show the friendly labels in the app and save the lowercase values in the database.
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  saved: "bg-slate-100 text-slate-700",
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-violet-100 text-violet-700",
  interview: "bg-amber-100 text-amber-800",
  offer: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  withdrawn: "bg-stone-100 text-stone-600",
};
