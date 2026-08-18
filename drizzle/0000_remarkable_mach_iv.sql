-- These enums limit status and work-mode fields to the choices shown in the app.
CREATE TYPE "public"."application_status" AS ENUM('saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."work_mode" AS ENUM('remote', 'hybrid', 'onsite');--> statement-breakpoint
-- This is the first table in OfferTrail. Clerk owns accounts, so only its user ID is stored here.
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"company" varchar(120) NOT NULL,
	"position" varchar(120) NOT NULL,
	"location" varchar(120),
	"job_url" text,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"work_mode" "work_mode" DEFAULT 'remote' NOT NULL,
	"applied_at" date,
	"next_step_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- These indexes make the user's dashboard and status filters faster as data grows.
CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "applications_user_status_idx" ON "applications" USING btree ("clerk_user_id","status");
