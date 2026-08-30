import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PrevNextNav({
  previous,
  next,
}: {
  previous?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <div className="mt-8 flex justify-between gap-3 border-t border-border pt-5">
      {previous ? <Link href={previous.href}><Button variant="secondary">← {previous.label}</Button></Link> : <span />}
      {next ? <Link href={next.href}><Button variant="secondary">{next.label} →</Button></Link> : <span />}
    </div>
  );
}
