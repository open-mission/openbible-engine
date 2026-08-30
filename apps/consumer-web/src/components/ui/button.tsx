import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:brightness-110",
    secondary: "bg-muted text-foreground hover:bg-accent",
    ghost: "bg-transparent text-foreground hover:bg-accent",
    danger: "bg-rose-700 text-white hover:bg-rose-800",
  };
  return (
    <button
      className={cn("rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50", styles[variant], className)}
      {...props}
    />
  );
}
