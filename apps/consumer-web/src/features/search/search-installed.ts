import type { BibleEngine } from "@openbible/engine";
import type { InstalledBible } from "@openbible/engine-core";
import { bookRouteSegment } from "@/features/reader/reader-route";
import type { DisplaySearchResult } from "@/features/search/SearchResults";

export async function searchInstalledVersions(
  engine: Pick<BibleEngine, "listInstalledVersions" | "searchVerses" | "getBooks">,
  query: string,
  limit: number,
): Promise<DisplaySearchResult[]> {
  const installed: InstalledBible[] = await engine.listInstalledVersions();
  const perVersion = await Promise.all(installed.map(async (version) => {
    const [books, result] = await Promise.all([engine.getBooks(version.id), engine.searchVerses({ versionId: version.id, query, limit })]);
    return result.results.map((verse) => {
      const book = books.find((candidate) => candidate.id === verse.bookId);
      return { versionId: version.id, versionName: version.name, bookSegment: book ? bookRouteSegment(book, books) : verse.bookId, verse };
    });
  }));
  return perVersion.flat().slice(0, limit);
}
