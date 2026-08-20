import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// I use these fixed choices so the form and database always use the same values.
export const applicationStatus = pgEnum("application_status", [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

export const workMode = pgEnum("work_mode", ["remote", "hybrid", "onsite"]);

export const progressUpdateType = pgEnum("progress_update_type", [
  "follow_up",
  "screening",
  "interview",
  "assessment",
  "offer",
  "rejected",
  "withdrawn",
  "custom",
]);

// Each row stores one job application for one Clerk user.
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    company: varchar("company", { length: 120 }).notNull(),
    position: varchar("position", { length: 120 }).notNull(),
    location: varchar("location", { length: 120 }),
    jobUrl: text("job_url"),
    status: applicationStatus("status").default("applied").notNull(),
    workMode: workMode("work_mode").default("remote").notNull(),
    appliedAt: date("applied_at"),
    nextStepAt: timestamp("next_step_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // I added this index because the dashboard usually looks up jobs by user ID.
    index("applications_user_id_idx").on(table.clerkUserId),
    index("applications_user_status_idx").on(table.clerkUserId, table.status),
  ],
);

// Each row records one dated change in an application's progress history.
export const applicationUpdates = pgTable(
  "application_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    type: progressUpdateType("type").notNull(),
    description: varchar("description", { length: 160 }).notNull(),
    updateDate: date("update_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // I index both IDs because updates are normally loaded by application or user.
    index("application_updates_application_id_idx").on(table.applicationId),
    index("application_updates_user_id_idx").on(table.clerkUserId),
  ],
);

// I get these TypeScript types from the table so the UI stays in sync with the database.
export type Application = typeof applications.$inferSelect;
export type ApplicationUpdate = typeof applicationUpdates.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
