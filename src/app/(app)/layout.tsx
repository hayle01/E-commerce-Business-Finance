import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MobileNav, MobileTopBar, Sidebar } from "@/components/app-shell";
import { AccountMenu } from "@/components/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  return (
    <>
      <Sidebar />
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-56">
        <MobileTopBar userName={session.user.name} userEmail={session.user.email} />
        <header className="hidden items-center justify-end gap-3 border-b border-border px-6 py-3 md:flex">
          <ThemeToggle />
          <AccountMenu name={session.user.name} email={session.user.email} />
        </header>
        {children}
      </div>
      <MobileNav />
    </>
  );
}
