"use client";

import { useActionState, useState } from "react";
import { createApplication, updateApplication } from "@/actions/applications";
import type { Application } from "@/db/schema";
import { WORK_MODES } from "@/lib/constants";
import type { ImportedJobDetails } from "@/lib/job-import";
import { EMPTY_ACTION_STATE } from "@/lib/validation";
import { JobImportPanel } from "./job-import-panel";
import { StatusBadge } from "./status-badge";
import { SubmitButton } from "./submit-button";

type ApplicationFormProps = {
  application?: Application;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="field-error">{messages[0]}</p>;
}

// I reuse this form for both adding and editing a job application.
export function ApplicationForm({ application }: ApplicationFormProps) {
  const chosenAction = application
    ? updateApplication.bind(null, application.id)
    : createApplication;
  const [state, formAction] = useActionState(chosenAction, EMPTY_ACTION_STATE);
  const [fields, setFields] = useState({
    company: application?.company ?? "",
    position: application?.position ?? "",
    location: application?.location ?? "",
    workMode: application?.workMode ?? "remote",
    jobUrl: application?.jobUrl ?? "",
    salaryRange: application?.salaryRange ?? "",
    jobDescription: application?.jobDescription ?? "",
    applicationDeadline: application?.applicationDeadline ?? "",
    appliedAt: application?.appliedAt ?? "",
    notes: application?.notes ?? "",
  });

  function updateField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function applyImportedDetails(details: ImportedJobDetails) {
    // I keep the pasted link and replace only fields that the importer actually found.
    setFields((current) => ({
      ...current,
      ...Object.fromEntries(
        Object.entries(details).filter(([, value]) => value !== undefined && value !== ""),
      ),
    }));
  }

  return (
    <form action={formAction} className="application-form">
      <input name="status" type="hidden" value={application?.status ?? "applied"} />
      {state.message && <div className="form-error">{state.message}</div>}

      {!application && (
        <JobImportPanel
          jobUrl={fields.jobUrl}
          onImport={applyImportedDetails}
          onJobUrlChange={(value) => updateField("jobUrl", value)}
        />
      )}

      <div className="form-section">
        <div>
          <h2 className="form-section-title">Role details</h2>
          <p className="form-section-copy">The basic information about this opportunity.</p>
        </div>
        <div className="form-fields">
          <label className="field-label">
            Company name
            <input
              maxLength={120}
              name="company"
              onChange={(event) => updateField("company", event.target.value)}
              required
              value={fields.company}
            />
            <FieldError messages={state.errors?.company} />
          </label>
          <label className="field-label">
            Position
            <input
              maxLength={120}
              name="position"
              onChange={(event) => updateField("position", event.target.value)}
              required
              value={fields.position}
            />
            <FieldError messages={state.errors?.position} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Location
              <input
                maxLength={120}
                name="location"
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="Vancouver, BC"
                value={fields.location}
              />
              <FieldError messages={state.errors?.location} />
            </label>
            <label className="field-label">
              Work setup
              <select
                name="workMode"
                onChange={(event) => updateField("workMode", event.target.value)}
                value={fields.workMode}
              >
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
              <FieldError messages={state.errors?.workMode} />
            </label>
          </div>
          {application ? (
            <label className="field-label">
              Job posting link
              <input
                name="jobUrl"
                onChange={(event) => updateField("jobUrl", event.target.value)}
                placeholder="https://company.com/jobs/..."
                type="url"
                value={fields.jobUrl}
              />
              <FieldError messages={state.errors?.jobUrl} />
            </label>
          ) : (
            // I submit the link from the import panel even though its visible input sits above the form sections.
            <input name="jobUrl" type="hidden" value={fields.jobUrl} />
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Salary range
              <input
                maxLength={160}
                name="salaryRange"
                onChange={(event) => updateField("salaryRange", event.target.value)}
                placeholder="CAD 80,000–100,000 per year"
                value={fields.salaryRange}
              />
              <FieldError messages={state.errors?.salaryRange} />
            </label>
            <label className="field-label">
              Application deadline
              <input
                name="applicationDeadline"
                onChange={(event) => updateField("applicationDeadline", event.target.value)}
                type="date"
                value={fields.applicationDeadline}
              />
              <FieldError messages={state.errors?.applicationDeadline} />
            </label>
          </div>
          <label className="field-label">
            Job description
            <textarea
              maxLength={12000}
              name="jobDescription"
              onChange={(event) => updateField("jobDescription", event.target.value)}
              placeholder="The imported job description will appear here."
              rows={8}
              value={fields.jobDescription}
            />
            <span className="field-help">
              OfferTrail saves this copy in case the original posting is removed later.
            </span>
            <FieldError messages={state.errors?.jobDescription} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div>
          <h2 className="form-section-title">Progress</h2>
          <p className="form-section-copy">
            {application
              ? "Your current stage changes when you add a progress update below."
              : "Start the timeline with the date you applied."}
          </p>
        </div>
        <div className="form-fields">
          {application && (
            <div className="field-label">
              Current status
              <div><StatusBadge status={application.status} /></div>
              <span className="field-help">Add a progress update after saving any changes.</span>
            </div>
          )}
          <label className="field-label">
            Date applied
            <input
              name="appliedAt"
              onChange={(event) => updateField("appliedAt", event.target.value)}
              type="date"
              value={fields.appliedAt}
            />
            <FieldError messages={state.errors?.appliedAt} />
          </label>
          <label className="field-label">
            Notes
            <textarea
              maxLength={3000}
              name="notes"
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Contacts, interview notes, or anything worth remembering..."
              rows={6}
              value={fields.notes}
            />
            <FieldError messages={state.errors?.notes} />
          </label>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <SubmitButton label={application ? "Save changes" : "Add application"} />
      </div>
    </form>
  );
}
