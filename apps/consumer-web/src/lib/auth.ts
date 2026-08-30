import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

function requiredRuntimeEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required authentication configuration: ${name}`);
  return value;
}

const baseURL = requiredRuntimeEnv("BETTER_AUTH_URL");

export const auth = betterAuth({
  database: new LibsqlDialect({
    url: requiredRuntimeEnv("DATABASE_URL"),
    authToken: requiredRuntimeEnv("DATABASE_TURSO_TOKEN"),
  }),
  baseURL,
  secret: requiredRuntimeEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [baseURL],
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});

export async function getServerSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export interface ServerSyncCredentials {
  accountId: string;
  credential: string;
  expiresAt: number;
}

export async function getServerSyncCredentials(
  request: Request,
): Promise<ServerSyncCredentials | null> {
  const session = await getServerSession(request);
  if (!session) return null;

  return {
    accountId: session.user.id,
    credential: session.session.token,
    expiresAt: session.session.expiresAt.getTime(),
  };
}
