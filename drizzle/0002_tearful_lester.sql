ALTER TABLE "applications" ADD COLUMN "salary_range" varchar(160);--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "job_description" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "application_deadline" date;