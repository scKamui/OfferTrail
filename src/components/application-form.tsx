"use client";

import { useActionState } from "react";
import { createApplication, updateApplication } from "@/actions/applications";
import type { Application } from "@/db/schema";
import { APPLICATION_STATUSES, STATUS_LABELS, WORK_MODES } from "@/lib/constants";
import { EMPTY_ACTION_STATE } from "@/lib/validation";
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

  // I remove the timezone ending because datetime-local does not accept it.
  const nextStepValue = application?.nextStepAt
    ? application.nextStepAt.toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="application-form">
      {state.message && <div className="form-error">{state.message}</div>}

      <div className="form-section">
        <div>
          <h2 className="form-section-title">Role details</h2>
          <p className="form-section-copy">The basic information about this opportunity.</p>
        </div>
        <div className="form-fields">
          <label className="field-label">
            Company name
            <input defaultValue={application?.company} name="company" maxLength={120} required />
            <FieldError messages={state.errors?.company} />
          </label>
          <label className="field-label">
            Position
            <input defaultValue={application?.position} name="position" maxLength={120} required />
            <FieldError messages={state.errors?.position} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Location
              <input defaultValue={application?.location ?? ""} name="location" maxLength={120} placeholder="Vancouver, BC" />
              <FieldError messages={state.errors?.location} />
            </label>
            <label className="field-label">
              Work setup
              <select defaultValue={application?.workMode ?? "remote"} name="workMode">
                {WORK_MODES.map((mode) => <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>)}
              </select>
              <FieldError messages={state.errors?.workMode} />
            </label>
          </div>
          <label className="field-label">
            Job posting link
            <input defaultValue={application?.jobUrl ?? ""} name="jobUrl" placeholder="https://company.com/jobs/..." type="url" />
            <FieldError messages={state.errors?.jobUrl} />
          </label>
        </div>
      </div>

      <div className="form-section">
        <div>
          <h2 className="form-section-title">Progress</h2>
          <p className="form-section-copy">Dates and stages help build the trail.</p>
        </div>
        <div className="form-fields">
          <label className="field-label">
            Current status
            <select defaultValue={application?.status ?? "applied"} name="status">
              {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
            </select>
            <FieldError messages={state.errors?.status} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              Date applied
              <input defaultValue={application?.appliedAt ?? ""} name="appliedAt" type="date" />
              <FieldError messages={state.errors?.appliedAt} />
            </label>
            <label className="field-label">
              Next step
              <input defaultValue={nextStepValue} name="nextStepAt" type="datetime-local" />
              <FieldError messages={state.errors?.nextStepAt} />
            </label>
          </div>
          <label className="field-label">
            Notes
            <textarea defaultValue={application?.notes ?? ""} name="notes" maxLength={3000} rows={6} placeholder="Contacts, interview notes, salary range, or anything worth remembering..." />
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
