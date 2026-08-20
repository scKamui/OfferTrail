import type { ApplicationUpdate } from "@/db/schema";
import { PROGRESS_UPDATE_LABELS } from "@/lib/constants";

function formatDate(value: string) {
  // I build date-only values myself so timezones cannot move them to another day.
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function ProgressHistory({ updates }: { updates: ApplicationUpdate[] }) {
  if (updates.length === 0) {
    return (
      <div className="progress-empty">
        No progress updates yet. Add the first one when something changes.
      </div>
    );
  }

  return (
    <ol className="progress-history">
      {updates.map((update) => (
        <li className="progress-history-item" key={update.id}>
          <span className="progress-history-dot" />
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <strong>{update.description}</strong>
              <span className="progress-history-date">{formatDate(update.updateDate)}</span>
            </div>
            <p className="progress-history-type">{PROGRESS_UPDATE_LABELS[update.type]}</p>
            {update.notes && <p className="progress-history-notes">{update.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
