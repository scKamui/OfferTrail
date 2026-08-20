"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { ApplicationStatus } from "@/lib/constants";

// I pass dates to this Client Component as strings so Next.js can send them safely.
type CalendarItem = {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  nextStepAt: string | null;
};

type CalendarEvent = CalendarItem & {
  day: number;
  kind: "applied" | "next-step";
  month: number;
  year: number;
};

// I send the calendar plain data from the server because the calendar is interactive.
export function CalendarView({ applications }: { applications: CalendarItem[] }) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  // I add one event for the applied date and another for the next step when it exists.
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
          ...application,
          day: appliedDay,
          kind: "applied",
          month: appliedMonth - 1,
          year: appliedYear,
        });
      }

      if (application.nextStepAt) {
        const nextStepDate = new Date(application.nextStepAt);

        addEvent({
          ...application,
          day: nextStepDate.getDate(),
          kind: "next-step",
          month: nextStepDate.getMonth(),
          year: nextStepDate.getFullYear(),
        });
      }

    });

    return groupedEvents;
  }, [applications]);

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
          <p className="mt-1 text-xs text-slate-500">Applied dates and upcoming next steps</p>
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
                    <div
                      className={`calendar-event calendar-event-${item.status} ${item.kind === "next-step" ? "calendar-event-next-step" : ""}`}
                      key={`${item.id}-${item.kind}`}
                    >
                      <span className="calendar-event-kind">
                        {item.kind === "applied" ? "Applied" : "Next step"}
                      </span>
                      <strong>{item.company}</strong>
                      <span>{item.position}</span>
                    </div>
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
