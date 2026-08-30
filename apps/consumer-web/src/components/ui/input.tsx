import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("min-h-10 w-full rounded-md border border-border bg-card px-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30", className)}
      {...props}
    />
  );
}
