import { Brand } from "@/components/brand";

// I use this centered layout for both Clerk screens.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="absolute left-6 top-6 sm:left-10 sm:top-8">
        <Brand />
      </div>
      <div className="auth-card">{children}</div>
    </main>
  );
}
