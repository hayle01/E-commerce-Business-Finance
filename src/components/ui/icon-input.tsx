import type { LucideIcon } from "lucide-react";

export function IconInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: LucideIcon }) {
  return (
    <div className="relative">
      <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input {...props} className={`input w-full pl-9 ${props.className ?? ""}`} />
    </div>
  );
}
