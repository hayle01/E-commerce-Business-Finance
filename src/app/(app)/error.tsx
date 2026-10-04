"use client";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-4 md:p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message || "Please try again."}</p>
      <button onClick={reset} className="btn-secondary mt-4">Try again</button>
    </main>
  );
}
