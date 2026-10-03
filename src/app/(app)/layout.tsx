import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MobileNav, Sidebar } from "@/components/app-shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  return (
    <>
      <Sidebar />
      <div className="pb-16 md:pb-0 md:pl-56">{children}</div>
      <MobileNav />
    </>
  );
}
