import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { getApplication } from "@/lib/applications";

type EditApplicationPageProps = {
  params: Promise<{ id: string }>;
};

// I wait for the route details because modern Next.js provides them as a Promise.
export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) return null;

  const application = await getApplication(userId, id);
  if (!application) notFound();

  return (
    <div className="page-container page-container-narrow">
      <Link className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link>
      <div className="mt-7">
        <p className="eyebrow">Application details</p>
        <h1 className="page-title">Edit {application.company}</h1>
        <p className="mt-2 text-slate-500">Update the stage, next step, or anything you learned.</p>
      </div>
      <div className="form-card mt-8"><ApplicationForm application={application} /></div>
    </div>
  );
}
