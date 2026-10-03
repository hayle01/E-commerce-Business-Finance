export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <main className="p-4 md:p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-neutral-500">This module will be built in a later phase.</p>
    </main>
  );
}
