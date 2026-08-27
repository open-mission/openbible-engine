import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    ghost: "bg-transparent text-slate-200 hover:bg-slate-800",
    danger: "bg-rose-700 text-white hover:bg-rose-800",
  };
  return (
    <button
      className={cn("rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50", styles[variant], className)}
      {...props}
    />
  );
}
