import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border border-slate-600 px-2 py-0.5 text-xs text-slate-300", className)}
      {...props}
    />
  );
}
