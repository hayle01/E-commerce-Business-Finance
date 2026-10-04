export const metadata = {
  title: "Offline — Commerce & Finance",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This page isn&apos;t cached yet. New sales, expenses and uploads require a connection —
          nothing is recorded while offline.
        </p>
      </div>
    </main>
  );
}
