import { auth, currentUser } from "@clerk/nextjs/server";
import { BriefcaseBusiness, CalendarCheck, CircleCheckBig, Plus, Search } from "lucide-react";
import Link from "next/link";
import { ApplicationTable } from "@/components/application-table";
import { CalendarView } from "@/components/calendar-view";
import { StatCard } from "@/components/stat-card";
import { APPLICATION_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";
import { getApplications, getProgressUpdates } from "@/lib/applications";

type DashboardPageProps = {
  searchParams: Promise<{ query?: string; status?: string; view?: string }>;
};

// I keep the dashboard on the server so it can read private data safely.
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // I load these at the same time because neither one has to wait for the other.
  const [{ userId }, user, filters] = await Promise.all([
    auth(),
    currentUser(),
    searchParams,
  ]);

  if (!userId) return null;

  const status = APPLICATION_STATUSES.includes(filters.status as ApplicationStatus)
    ? (filters.status as ApplicationStatus)
    : undefined;
  const [applicationRows, progressUpdates] = await Promise.all([
    getApplications(userId, { query: filters.query, status }),
    getProgressUpdates(userId),
  ]);
  const interviewCount = applicationRows.filter((item) => item.status === "interview").length;
  const offerCount = applicationRows.filter((item) => item.status === "offer").length;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = progressUpdates.filter((item) => item.updateDate >= today).length;
  const firstName = user?.firstName ?? "there";
  const calendarMode = filters.view === "calendar";

  return (
    <div className="page-container">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Monday overview</p>
          <h1 className="page-title">Welcome back, {firstName}.</h1>
          <p className="mt-2 text-slate-500">Here is what is happening across your job search.</p>
        </div>
        <Link className="button button-primary" href="/applications/new">
          <Plus size={17} /> Add application
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total applications" value={applicationRows.length} detail="Across all active stages" icon={BriefcaseBusiness} />
        <StatCard label="Interviews" value={interviewCount} detail="Applications at interview stage" icon={CalendarCheck} />
        <StatCard label="Offers" value={offerCount} detail={`${upcomingCount} upcoming updates`} icon={CircleCheckBig} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="segmented-control">
            <Link className={!calendarMode ? "active" : ""} href="/dashboard">Applications</Link>
            <Link className={calendarMode ? "active" : ""} href="/dashboard?view=calendar">Calendar</Link>
          </div>
          {!calendarMode && (
            <form className="filter-form" method="get">
              <label className="search-field">
                <Search size={16} /><span className="sr-only">Search</span>
                <input defaultValue={filters.query} name="query" placeholder="Search company or role" />
              </label>
              <select defaultValue={status ?? ""} name="status" aria-label="Filter by status">
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option} value={option}>{STATUS_LABELS[option]}</option>
                ))}
              </select>
              <button className="button button-secondary" type="submit">Filter</button>
            </form>
          )}
        </div>

        {calendarMode ? (
          <CalendarView applications={applicationRows.map((item) => ({
            id: item.id,
            company: item.company,
            position: item.position,
            appliedAt: item.appliedAt,
          }))} updates={progressUpdates} />
        ) : (
          <ApplicationTable applications={applicationRows} updates={progressUpdates} />
        )}
      </section>
    </div>
  );
}
