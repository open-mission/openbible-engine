import { Suspense } from "react";
import { Reader, ReaderLoadingSkeleton } from "@/features/reader/Reader";

type ReaderRouteParams = { version: string; book: string; chapter: string };

// TODO: Cache Components adoption. Adopt this dynamic route after the shared shell is ready.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

async function ReaderRoute({ params }: { params: Promise<ReaderRouteParams> }) {
  return <Reader routeParams={await params} />;
}

export default function ReaderPage({ params }: { params: Promise<ReaderRouteParams> }) {
  return (
    <Suspense fallback={<ReaderLoadingSkeleton />}>
      <ReaderRoute params={params} />
    </Suspense>
  );
}
