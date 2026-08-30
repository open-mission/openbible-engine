import Link from "next/link";

export function Breadcrumbs({ current, items = [] }: { current: string; items?: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="hover:text-primary">openbible-engine</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link href="/" className="hover:text-primary">Consumer Web</Link></li>
        {items.map((item) => (
          <li key={item.href} className="contents">
            <span aria-hidden="true">/</span>
            <Link href={item.href} className="hover:text-primary">{item.label}</Link>
          </li>
        ))}
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-foreground">{current}</li>
      </ol>
    </nav>
  );
}
