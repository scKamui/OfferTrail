"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

// I use the form status so this button can show when the form is saving.
export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-primary" disabled={pending} type="submit">
      {pending && <LoaderCircle className="animate-spin" size={17} />}
      {pending ? "Saving..." : label}
    </button>
  );
}
