"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

// I use the form status to show feedback while the job is being deleted.
export function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="icon-button icon-button-danger"
      disabled={pending}
      title="Delete application"
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Delete this application?")) event.preventDefault();
      }}
    >
      <Trash2 size={16} />
      <span className="sr-only">{pending ? "Deleting" : "Delete application"}</span>
    </button>
  );
}
