export function AuthFormShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 p-6">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {children}
        {footer && <p className="mt-4 text-sm text-neutral-500">{footer}</p>}
      </div>
    </main>
  );
}
