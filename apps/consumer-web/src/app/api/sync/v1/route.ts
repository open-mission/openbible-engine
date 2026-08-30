export const runtime = "nodejs";

export function GET(): Response {
  return Response.json({ error: { code: "route_not_found", message: "Use a versioned Sync operation route" } }, { status: 404 });
}
