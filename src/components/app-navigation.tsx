"use client";

import { UserButton } from "@clerk/nextjs";
import { CalendarDays, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";

// I use a Client Component here because the highlighted link depends on the current URL.
export function AppNavigation() {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard?view=calendar", label: "Calendar", icon: CalendarDays },
  ];

  return (
    <>
      <aside className="app-sidebar">
        <Brand />
        <nav className="mt-10 space-y-1" aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href.split("?")[0] && label === "Dashboard";
            return (
              <Link className={`nav-link ${active ? "nav-link-active" : ""}`} href={href} key={label}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <Link className="button button-primary mt-6 w-full" href="/applications/new">
          <Plus size={17} /> Add application
        </Link>
        <div className="mt-auto flex items-center gap-3 border-t border-slate-200 pt-5">
          <UserButton />
          <span className="text-sm font-medium text-slate-600">Account</span>
        </div>
      </aside>

      {/* I use a smaller top bar on phones to leave more room for the page. */}
      <header className="mobile-header">
        <Brand compact />
        <div className="flex items-center gap-2">
          <Link className="icon-button" href="/applications/new" aria-label="Add application">
            <Plus size={19} />
          </Link>
          <UserButton />
        </div>
      </header>
    </>
  );
}
