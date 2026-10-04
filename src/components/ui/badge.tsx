const variants: Record<string, string> = {
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
  muted: "badge badge-muted",
  default: "badge",
};

export function Badge({ label, variant = "default" }: { label: string; variant?: keyof typeof variants }) {
  return <span className={variants[variant]}>{label}</span>;
}
