import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("min-h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30", className)}
      {...props}
    />
  );
}
