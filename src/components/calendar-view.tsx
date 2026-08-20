"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProgressUpdateType } from "@/lib/constants";

// I pass dates to this Client Component as strings so Next.js can send them safely.
type CalendarItem = {
  id: string;
  company: string;
  position: string;
  appliedAt: string | null;
};

type ProgressCalendarItem = {
  id: string;
  applicationId: string;
  company: string;
  position: string;
  description: string;
  type: ProgressUpdateType;
  updateDate: string;
};

type CalendarEvent = {
  applicationId: string;
  color: ProgressUpdateType | "applied";
  company: string;
  description: string;
  day: number;
  eventId: string;
  kind: "applied" | "progress-update";
  month: number;
  position: string;
  year: number;
};

// I send the calendar plain data from the server because the calendar is interactive.
export function CalendarView({
  applications,
  updates,
}: {
  applications: CalendarItem[];
  updates: ProgressCalendarItem[];
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  // I add the applied date and every saved progress update to the calendar.
  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map<string, CalendarEvent[]>();

    function addEvent(event: CalendarEvent) {
      const key = `${event.year}-${event.month}-${event.day}`;
      groupedEvents.set(key, [...(groupedEvents.get(key) ?? []), event]);
    }

    applications.forEach((application) => {

      if (application.appliedAt) {
        // I split date-only values myself so a timezone cannot move them to the wrong day.
        const [appliedYear, appliedMonth, appliedDay] = application.appliedAt
          .split("-")
          .map(Number);

        addEvent({
          applicationId: application.id,
          color: "applied",
          company: application.company,
          description: "Applied",
          day: appliedDay,
          eventId: `applied-${application.id}`,
          kind: "applied",
          month: appliedMonth - 1,
          position: application.position,
          year: appliedYear,
        });
      }
    });

    updates.forEach((update) => {
      const [updateYear, updateMonth, updateDay] = update.updateDate.split("-").map(Number);

      addEvent({
        applicationId: update.applicationId,
        color: update.type,
        company: update.company,
        description: update.description,
        day: updateDay,
        eventId: update.id,
        kind: "progress-update",
        month: updateMonth - 1,
        position: update.position,
        year: updateYear,
      });
    });

    return groupedEvents;
  }, [applications, updates]);

  const days = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [month, year]);

  function changeMonth(offset: number) {
    setVisibleMonth(new Date(year, month + offset, 1));
  }

  function itemsForDay(day: number) {
    // I group the events once so each calendar day can find its items quickly.
    return eventsByDate.get(`${year}-${month}-${day}`) ?? [];
  }

  const title = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric" })
    .format(visibleMonth);

  return (
    <section className="calendar-card">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Applied dates and progress updates. Click any item to edit the application.
          </p>
        </div>
        <div className="flex gap-1">
          <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="calendar-grid">
        {days.map((day, index) => (
          <div className={`calendar-day ${day ? "" : "calendar-day-empty"}`} key={`${day}-${index}`}>
            {day && (
              <>
                <span className="text-sm font-medium text-slate-500">{day}</span>
                <div className="mt-2 space-y-1">
                  {itemsForDay(day).map((item) => (
                    <Link
                      aria-label={`Edit ${item.position} at ${item.company}`}
                      className={`calendar-event calendar-event-${item.color} ${item.kind === "progress-update" ? "calendar-event-progress-update" : ""}`}
                      href={`/applications/${item.applicationId}/edit`}
                      key={item.eventId}
                      title="Edit application"
                    >
                      <span className="calendar-event-kind">
                        {item.kind === "applied" ? "Application" : "Progress update"}
                      </span>
                      <strong>{item.description}</strong>
                      <span>{item.company} · {item.position}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
