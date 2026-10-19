import { db } from "@/configs/db";
import { websitesTable } from "@/configs/schema";
import { eq } from "drizzle-orm";

type Website = typeof websitesTable.$inferSelect;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function hostnameOf(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

export type IngestAuthResult =
  | { ok: true; website: Website }
  | { ok: false; status: number; reason: string };

/**
 * Gate for the public ingestion endpoints.
 *
 * `/api/track` and `/api/live` have to stay unauthenticated and CORS-open
 * because they are called from customer sites, so the website ID in the
 * payload is the only identity on offer. Without these checks anyone who
 * reads an install snippet can write arbitrary pageviews into another
 * customer's dashboard.
 *
 * A 202 result means the request was well-formed but deliberately not
 * stored — currently only localhost traffic on sites that have not opted in.
 */
export async function authorizeIngest(
  req: Request,
  websiteId: unknown
): Promise<IngestAuthResult> {
  if (typeof websiteId !== "string" || !UUID_PATTERN.test(websiteId)) {
    return { ok: false, status: 400, reason: "Invalid or missing websiteId" };
  }

  const [website] = await db
    .select()
    .from(websitesTable)
    .where(eq(websitesTable.websiteId, websiteId))
    .limit(1);

  if (!website) {
    return { ok: false, status: 404, reason: "Unknown websiteId" };
  }

  const originHost = hostnameOf(
    req.headers.get("origin") ?? req.headers.get("referer")
  );

  if (!originHost) {
    return { ok: false, status: 403, reason: "Missing Origin header" };
  }

  if (isLocalHostname(originHost)) {
    if (!website.enableLocalHostTracking) {
      return { ok: false, status: 202, reason: "Localhost tracking is disabled" };
    }
    return { ok: true, website };
  }

  const registeredHost = hostnameOf(website.domain);
  const originMatchesRegistration =
    registeredHost !== null &&
    (originHost === registeredHost || originHost.endsWith(`.${registeredHost}`));

  if (!originMatchesRegistration) {
    return {
      ok: false,
      status: 403,
      reason: "Origin does not match the registered domain",
    };
  }

  return { ok: true, website };
}
