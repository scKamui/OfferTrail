import Link from "next/link";

// I show this page when the requested job application cannot be found.
export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f3] px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">That trail ends here.</h1>
        <p className="mt-3 text-slate-500">The page may have moved, or the application may no longer exist.</p>
        <Link className="button button-primary mt-6" href="/dashboard">Return to dashboard</Link>
      </div>
    </main>
  );
}
