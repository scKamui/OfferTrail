import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ApplicationForm } from "@/components/application-form";

// I keep this page simple because the shared form handles the actual form behavior.
export default function NewApplicationPage() {
  return (
    <div className="page-container page-container-narrow">
      <Link className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link>
      <div className="mt-7">
        <p className="eyebrow">New opportunity</p>
        <h1 className="page-title">Add an application</h1>
        <p className="mt-2 text-slate-500">Start with what you know. You can update everything later.</p>
      </div>
      <div className="form-card mt-8"><ApplicationForm /></div>
    </div>
  );
}
