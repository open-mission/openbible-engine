import {
  EngineError,
  isEngineError,
  type BibleInstaller,
  type BiblePackageSource,
  type InstalledBibleRegistry,
} from "@openbible/engine";
import {
  validateSyncIdentifier,
  type BibleVersionPreference,
} from "@openbible/sync-core";

export interface BiblePreferenceSyncDependencies {
  registry: InstalledBibleRegistry;
  installer: BibleInstaller;
  packageSource: BiblePackageSource;
  now?: () => number;
}

export interface BiblePreferenceApplyResult {
  preference: BibleVersionPreference;
  outcome: "installed" | "already_installed" | "pending";
  errorCode?: string;
}

export async function applyBibleVersionPreference(
  preference: BibleVersionPreference,
  dependencies: BiblePreferenceSyncDependencies,
): Promise<BiblePreferenceApplyResult> {
  validateSyncIdentifier(preference.accountId, "accountId");
  validateSyncIdentifier(preference.versionId, "versionId");
  if (!preference.name.trim() || !preference.source.trim()) {
    throw new EngineError("invalid_package", "Bible preference metadata is incomplete");
  }

  const installed = await dependencies.registry.get(preference.versionId);
  if (installed) {
    return {
      outcome: "already_installed",
      preference: {
        ...preference,
        installedAt: installed.installedAt,
        state: "available",
      },
    };
  }

  let bytes: Uint8Array;
  try {
    bytes = await dependencies.packageSource.fetchPackage(preference.versionId);
  } catch (cause) {
    return {
      outcome: "pending",
      errorCode: isEngineError(cause) ? cause.code : "version_source_unavailable",
      preference: { ...preference, state: "pending" },
    };
  }

  const installedVersion = await dependencies.installer.install({
    versionId: preference.versionId,
    bytes,
    name: preference.name,
    installedAt: (dependencies.now ?? (() => Date.now()))(),
    versionCode: 1,
  });

  return {
    outcome: "installed",
    preference: {
      ...preference,
      installedAt: installedVersion.installedAt,
      state: "available",
    },
  };
}
