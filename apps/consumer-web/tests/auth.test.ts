import { createClient } from "@libsql/client";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const baseURL = "http://localhost:3000";
const directory = mkdtempSync(join("/tmp/opencode", "openbible-auth-"));
const client = createClient({ url: `file:${join(directory, "auth.db")}` });

process.env.BETTER_AUTH_URL = baseURL;
process.env.BETTER_AUTH_SECRET = "synthetic-test-secret-for-auth-boundary";
process.env.DATABASE_URL = `file:${join(directory, "auth.db")}`;
process.env.DATABASE_TURSO_TOKEN = "synthetic-test-token";

const { auth, getServerSession, getServerSyncCredentials } = await import("@/lib/auth");
const authRoute = await import("@/app/api/auth/[...all]/route");

function authRequest(path: string, init?: RequestInit): Request {
  return new Request(`${baseURL}${path}`, {
    ...init,
    headers: {
      origin: baseURL,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
}

describe("Better Auth server boundary", () => {
  beforeAll(async () => {
    const migration = readFileSync(join(process.cwd(), "migrations/001-better-auth.sql"), "utf8");
    await client.executeMultiple(migration);
  });

  afterAll(() => {
    client.close();
    rmSync(directory, { recursive: true, force: true });
  });

  // SPECSFY: US-001 US-002 US-003 US-004 FR-002 FR-007 NFR-001 NFR-002 AC-022
  it("derives Sync credentials from a valid server-side session", async () => {
    const response = await authRoute.POST(
      authRequest("/api/auth/sign-up/email", {
        method: "POST",
        body: JSON.stringify({
          name: "Synthetic User",
          email: "boundary@example.com",
          password: "synthetic-password",
        }),
      }),
    );
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(cookie).toContain("session_token");

    const request = authRequest("/api/sync/v1/push", { headers: { cookie } });
    const session = await getServerSession(request);
    const credentials = await getServerSyncCredentials(request);

    expect(session?.user.id).toBeTruthy();
    expect(credentials).toEqual({
      accountId: session?.user.id,
      credential: session?.session.token,
      expiresAt: session?.session.expiresAt.getTime(),
    });
  });

  it("rejects expired and revoked sessions on every server lookup", async () => {
    const expiredResponse = await auth.handler(
      authRequest("/api/auth/sign-up/email", {
        method: "POST",
        body: JSON.stringify({
          name: "Expired User",
          email: "expired@example.com",
          password: "synthetic-password",
        }),
      }),
    );
    const expiredCookie = expiredResponse.headers.get("set-cookie") ?? "";

    await client.execute({
      sql: "UPDATE session SET expiresAt = ?",
      args: [new Date(0).toISOString()],
    });
    expect(await getServerSession(authRequest("/api/sync/v1/push", { headers: { cookie: expiredCookie } }))).toBeNull();

    const revokedResponse = await auth.handler(
      authRequest("/api/auth/sign-up/email", {
        method: "POST",
        body: JSON.stringify({
          name: "Revoked User",
          email: "revoked@example.com",
          password: "synthetic-password",
        }),
      }),
    );
    const revokedCookie = revokedResponse.headers.get("set-cookie") ?? "";
    const revokedSession = await getServerSession(
      authRequest("/api/sync/v1/push", { headers: { cookie: revokedCookie } }),
    );

    await auth.api.revokeSession({
      body: { token: revokedSession?.session.token ?? "" },
      headers: new Headers({ cookie: revokedCookie }),
    });

    expect(await getServerSession(authRequest("/api/sync/v1/push", { headers: { cookie: revokedCookie } }))).toBeNull();
  });
});
