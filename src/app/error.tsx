"use client";

// I make this a Client Component so the Try again button can work.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8f3] px-6 text-center">
      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">We lost the trail for a moment.</h1>
        <p className="mt-3 text-slate-500">Your information is still safe. Try loading this part again.</p>
        <button className="button button-primary mt-6" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
