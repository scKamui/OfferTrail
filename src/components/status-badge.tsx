import type { ApplicationStatus } from "@/lib/constants";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";

// I match each saved status to a style instead of turning database text into CSS.
export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`status-pill ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
