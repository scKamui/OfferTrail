import { AppNavigation } from "@/components/app-navigation";

// I protect these pages in proxy.ts and use this layout for the signed-in app area.
export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <AppNavigation />
      <main className="app-content">{children}</main>
    </div>
  );
}
