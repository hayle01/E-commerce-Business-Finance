export function AuthFormShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="mt-1 mb-4 text-sm text-neutral-500">{description}</p>}
        {!description && <div className="mb-4" />}
        {children}
        {footer && <p className="mt-4 text-sm text-neutral-500">{footer}</p>}
      </div>
    </main>
  );
}
