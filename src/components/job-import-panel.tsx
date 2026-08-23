"use client";

import { Link2, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ImportedJobDetails } from "@/lib/job-import";

type JobImportPanelProps = {
  jobUrl: string;
  onJobUrlChange: (value: string) => void;
  onImport: (details: ImportedJobDetails) => void;
};

type ImportResponse = {
  details?: ImportedJobDetails;
  importedCount?: number;
  message?: string;
};

// I keep the import request in its own component so the main form stays easy to follow.
export function JobImportPanel({ jobUrl, onJobUrlChange, onImport }: JobImportPanelProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  async function importJob() {
    if (!jobUrl.trim()) {
      setIsSuccess(false);
      setMessage("Paste a job posting link first.");
      return;
    }

    setIsImporting(true);
    setMessage(undefined);

    try {
      const response = await fetch("/api/job-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      const result = (await response.json()) as ImportResponse;

      if (!response.ok || !result.details) {
        throw new Error(result.message || "The job could not be imported.");
      }

      // I fill only the details that were found and leave every field editable.
      onImport(result.details);
      setIsSuccess(true);
      setMessage(
        `I found ${result.importedCount ?? Object.values(result.details).filter(Boolean).length} job details. Review them before saving.`,
      );
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "The job could not be imported. You can still enter it manually.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="job-import-panel" aria-labelledby="job-import-title">
      <div className="job-import-heading">
        <span className="job-import-icon"><Sparkles aria-hidden="true" size={18} /></span>
        <div>
          <h2 id="job-import-title">Start with the job link</h2>
          <p>OfferTrail will fill in the details it can find. You can edit everything afterward.</p>
        </div>
      </div>

      <div className="job-import-controls">
        <label className="job-import-input">
          <Link2 aria-hidden="true" size={18} />
          <span className="sr-only">Job posting link</span>
          <input
            aria-describedby="job-import-help"
            autoComplete="url"
            onChange={(event) => onJobUrlChange(event.target.value)}
            placeholder="Paste a job posting link"
            type="url"
            value={jobUrl}
          />
        </label>
        <button className="button button-primary" disabled={isImporting} onClick={importJob} type="button">
          {isImporting ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} /> : <Sparkles aria-hidden="true" size={17} />}
          {isImporting ? "Finding details…" : "Import details"}
        </button>
      </div>

      <p className="field-help" id="job-import-help">
        Works best with public company career pages. Some job boards may block automatic importing.
      </p>
      {message && (
        <div aria-live="polite" className={isSuccess ? "form-success" : "form-error"}>
          {message}
        </div>
      )}
    </section>
  );
}
