import { Route } from "lucide-react";
import Link from "next/link";

// I reuse this component so the OfferTrail logo looks the same on every page.
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="inline-flex items-center gap-2.5 font-semibold" href="/">
      <span className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm">
        <Route size={19} aria-hidden="true" />
      </span>
      {!compact && <span className="text-lg tracking-tight">OfferTrail</span>}
    </Link>
  );
}
