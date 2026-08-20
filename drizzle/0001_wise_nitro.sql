CREATE TYPE "public"."progress_update_type" AS ENUM('follow_up', 'screening', 'interview', 'assessment', 'offer', 'rejected', 'withdrawn', 'custom');--> statement-breakpoint
CREATE TABLE "application_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"type" "progress_update_type" NOT NULL,
	"description" varchar(160) NOT NULL,
	"update_date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_updates" ADD CONSTRAINT "application_updates_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_updates_application_id_idx" ON "application_updates" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_updates_user_id_idx" ON "application_updates" USING btree ("clerk_user_id");