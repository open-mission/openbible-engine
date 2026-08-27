import type { BibleEngine } from "@openbible/engine";
import type { InstalledBible } from "@openbible/engine-core";
import type { DisplaySearchResult } from "@/features/search/SearchResults";

export async function searchInstalledVersions(
  engine: Pick<BibleEngine, "listInstalledVersions" | "searchVerses">,
  query: string,
  limit: number,
): Promise<DisplaySearchResult[]> {
  const installed: InstalledBible[] = await engine.listInstalledVersions();
  const perVersion = await Promise.all(installed.map(async (version) => {
    const result = await engine.searchVerses({ versionId: version.id, query, limit });
    return result.results.map((verse) => ({ versionId: version.id, versionName: version.name, verse }));
  }));
  return perVersion.flat().slice(0, limit);
}
