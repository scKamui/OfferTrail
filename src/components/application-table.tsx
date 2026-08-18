import { CalendarClock, ExternalLink, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { deleteApplication } from "@/actions/applications";
import type { Application } from "@/db/schema";
import { DeleteButton } from "./delete-button";
import { StatusBadge } from "./status-badge";

// I format dates here before the finished page is sent to the browser.
function formatDate(value: string | Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(value));
}

export function ApplicationTable({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><CalendarClock size={24} /></div>
        <h2 className="mt-4 text-lg font-semibold">No applications found</h2>
        <p className="mt-2 max-w-sm text-slate-500">
          Add your first application or adjust the search filters to see more results.
        </p>
        <Link className="button button-primary mt-5" href="/applications/new">
          Add an application
        </Link>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="application-table">
        <thead>
          <tr>
            <th>Company and role</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Next step</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>
                <div className="flex items-start gap-3">
                  <div className="company-mark">{application.company.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{application.company}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{application.position}</p>
                    {application.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} /> {application.location} · {application.workMode}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td><StatusBadge status={application.status} /></td>
              <td className="text-sm text-slate-600">{formatDate(application.appliedAt)}</td>
              <td className="text-sm text-slate-600">{formatDate(application.nextStepAt)}</td>
              <td>
                <div className="flex justify-end gap-1">
                  {application.jobUrl && (
                    <a
                      className="icon-button"
                      href={application.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open job posting"
                    >
                      <ExternalLink size={16} /><span className="sr-only">Open job posting</span>
                    </a>
                  )}
                  <Link className="icon-button" href={`/applications/${application.id}/edit`} title="Edit application">
                    <Pencil size={16} /><span className="sr-only">Edit application</span>
                  </Link>
                  {/* I use a server action here so deleting a job is handled safely. */}
                  <form action={deleteApplication}>
                    <input name="id" type="hidden" value={application.id} />
                    <DeleteButton />
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
