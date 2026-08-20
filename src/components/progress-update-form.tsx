"use client";

import { useActionState, useEffect, useRef } from "react";
import { addProgressUpdate } from "@/actions/progress-updates";
import { PROGRESS_UPDATE_LABELS, PROGRESS_UPDATE_TYPES } from "@/lib/constants";
import { EMPTY_ACTION_STATE } from "@/lib/validation";
import { SubmitButton } from "./submit-button";

type ProgressUpdateFormProps = {
  applicationId: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="field-error">{messages[0]}</p>;
}

export function ProgressUpdateForm({ applicationId }: ProgressUpdateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addProgressUpdate.bind(null, applicationId);
  const [state, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  // I clear the fields after an update is saved so the form is ready for the next one.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} className="progress-update-form" ref={formRef}>
      {state.message && (
        <div className={state.success ? "form-success" : "form-error"}>{state.message}</div>
      )}

      <div className="grid items-start gap-5 sm:grid-cols-2">
        <label className="field-label">
          Update type
          <select defaultValue="follow_up" name="type">
            {PROGRESS_UPDATE_TYPES.map((type) => (
              <option key={type} value={type}>{PROGRESS_UPDATE_LABELS[type]}</option>
            ))}
          </select>
          <FieldError messages={state.errors?.type} />
        </label>

        <label className="field-label">
          Date
          <input name="updateDate" required type="date" />
          <FieldError messages={state.errors?.updateDate} />
        </label>
      </div>

      <label className="field-label">
        Brief calendar description
        <input
          maxLength={160}
          name="description"
          placeholder="Example: Second interview scheduled"
        />
        <span className="field-help">
          Leave this empty to use the update type as the calendar description.
        </span>
        <FieldError messages={state.errors?.description} />
      </label>

      <label className="field-label">
        Notes (optional)
        <textarea
          maxLength={1000}
          name="notes"
          placeholder="Add any details you want to remember..."
          rows={3}
        />
        <FieldError messages={state.errors?.notes} />
      </label>

      <div className="flex justify-end">
        <SubmitButton label="Add progress update" />
      </div>
    </form>
  );
}
