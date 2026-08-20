import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { ProgressHistory } from "@/components/progress-history";
import { ProgressUpdateForm } from "@/components/progress-update-form";
import { getApplication, getApplicationUpdates } from "@/lib/applications";

type EditApplicationPageProps = {
  params: Promise<{ id: string }>;
};

// I wait for the route details because modern Next.js provides them as a Promise.
export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) return null;

  const [application, updates] = await Promise.all([
    getApplication(userId, id),
    getApplicationUpdates(userId, id),
  ]);
  if (!application) notFound();

  return (
    <div className="page-container page-container-narrow">
      <Link className="back-link" href="/dashboard"><ArrowLeft size={16} /> Back to dashboard</Link>
      <div className="mt-7">
        <p className="eyebrow">Application details</p>
        <h1 className="page-title">Edit {application.company}</h1>
        <p className="mt-2 text-slate-500">
          Update the job details or record what happened next.
        </p>
      </div>
      <div className="form-card mt-8"><ApplicationForm application={application} /></div>

      <section className="form-card mt-8 p-5 sm:p-8">
        <div>
          <p className="eyebrow">Progress</p>
          <h2 className="mt-2 text-xl font-semibold">Add a progress update</h2>
          <p className="mt-2 text-sm text-slate-500">
            Record a follow-up, interview, rejection, or any other change.
          </p>
        </div>
        <div className="mt-6"><ProgressUpdateForm applicationId={application.id} /></div>
      </section>

      <section className="form-card mt-8 p-5 sm:p-8">
        <h2 className="text-xl font-semibold">Progress history</h2>
        <p className="mt-2 text-sm text-slate-500">
          A dated record of everything that has happened with this application.
        </p>
        <div className="mt-6"><ProgressHistory updates={updates} /></div>
      </section>
    </div>
  );
}
