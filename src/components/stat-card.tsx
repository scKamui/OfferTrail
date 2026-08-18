import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
};

// I reuse this card for each number at the top of the dashboard.
export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="stat-icon"><Icon size={20} /></span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </article>
  );
}
