import { getServerSyncCredentials } from "@/lib/auth";
import { createSyncApiHandlers } from "@/lib/sync-api";
import { getSyncRemote } from "@/lib/sync-server";

export const runtime = "nodejs";
const handlers = createSyncApiHandlers({ authenticate: getServerSyncCredentials, getRemote: getSyncRemote });
export const POST = handlers.revokeDevice;
