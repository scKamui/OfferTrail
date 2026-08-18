import { Show } from "@clerk/nextjs";
import { ArrowRight, CalendarDays, CheckCircle2, LineChart } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";

// I use this public page to explain OfferTrail before someone signs up.
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between py-6">
          <Brand />
          <nav className="flex items-center gap-3" aria-label="Account links">
            <Show when="signed-out">
              <Link className="button button-ghost" href="/sign-in">
                Sign in
              </Link>
              <Link className="button button-primary" href="/sign-up">
                Start tracking
              </Link>
            </Show>
            <Show when="signed-in">
              <Link className="button button-primary" href="/dashboard">
                Open dashboard
              </Link>
            </Show>
          </nav>
        </header>

        <section className="grid items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="eyebrow">Your job search, clearly organized</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
              Follow every lead to the next opportunity.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              OfferTrail gives you one calm place to save roles, track interviews,
              remember follow-ups, and see where your job search is heading.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Show when="signed-out">
                <Link className="button button-primary button-large" href="/sign-up">
                  Create your free account <ArrowRight size={18} />
                </Link>
              </Show>
              <Show when="signed-in">
                <Link className="button button-primary button-large" href="/dashboard">
                  Continue to OfferTrail <ArrowRight size={18} />
                </Link>
              </Show>
              <a className="button button-secondary button-large" href="#features">
                See what it does
              </a>
            </div>
          </div>

          {/* I added this example so visitors can see what the dashboard tracks. */}
          <div className="hero-card">
            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm text-slate-500">This week</p>
                <p className="mt-1 text-2xl font-semibold">Application trail</p>
              </div>
              <span className="status-pill bg-emerald-100 text-emerald-700">On track</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Northstar Labs", "Product Designer", "Interview", "Tue, 10:30 AM"],
                ["Canopy Studio", "UX Researcher", "Screening", "Follow up Friday"],
                ["Harbour Tech", "UI Designer", "Applied", "Applied yesterday"],
              ].map(([company, role, status, detail]) => (
                <div className="sample-row" key={company}>
                  <div className="company-mark">{company.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{company}</p>
                    <p className="truncate text-sm text-slate-500">{role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{status}</p>
                    <p className="mt-1 text-xs text-slate-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 pb-20 md:grid-cols-3" id="features">
          {[
            [CheckCircle2, "Track every stage", "Move applications from saved to offer without losing the details."],
            [CalendarDays, "Remember what is next", "Keep interview dates and follow-ups visible on your calendar."],
            [LineChart, "Understand your progress", "See the shape of your search and where your attention is needed."],
          ].map(([Icon, title, description]) => (
            <article className="feature-card" key={String(title)}>
              <Icon className="text-emerald-700" size={24} />
              <h2 className="mt-5 text-lg font-semibold">{String(title)}</h2>
              <p className="mt-2 leading-7 text-slate-600">{String(description)}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
