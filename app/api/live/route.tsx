import { db } from "@/configs/db";
import { liveUserTable, websitesTable } from "@/configs/schema";
import { getClientIp, lookupGeo } from "@/lib/geo";
import { authorizeIngest, corsHeaders } from "@/lib/ingest";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq, gt, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

/** A visitor counts as live if they pinged within this window. */
const LIVE_WINDOW_MS = 30_000;

/** Rows older than this are pruned opportunistically on write. */
const STALE_AFTER_MS = 10 * 60 * 1000;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/* ------------------------ POST: heartbeat ------------------------ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const auth = await authorizeIngest(req, body?.websiteId);
    if (!auth.ok) {
      return NextResponse.json(
        { message: auth.reason },
        { status: auth.status, headers: corsHeaders() }
      );
    }

    const { website } = auth;

    if (typeof body.visitorId !== "string" || !body.visitorId) {
      return NextResponse.json(
        { message: "Missing visitorId" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const lastSeen = Number(body.last_seen);
    const now = Date.now();
    // Trust the server clock rather than a client-supplied timestamp, which
    // could be skewed or forged to keep a visitor permanently "live".
    const safeLastSeen = Number.isFinite(lastSeen) ? Math.min(lastSeen, now) : now;

    const parser = new UAParser(req.headers.get("user-agent") || "");
    const device =
      parser.getDevice().model || parser.getDevice().type || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const browser = parser.getBrowser().name || "Unknown";

    const geo = await lookupGeo(getClientIp(req));

    await db
      .insert(liveUserTable)
      .values({
        visitorId: body.visitorId,
        websiteId: website.websiteId,
        last_seen: safeLastSeen,
        city: geo.city,
        region: geo.region,
        country: geo.country,
        countryCode: geo.countryCode,
        lat: geo.lat,
        lng: geo.lng,
        device,
        os,
        browser,
      })
      .onConflictDoUpdate({
        // Matches the (websiteId, visitorId) unique constraint: the same
        // visitor may be active on several tracked sites at once.
        target: [liveUserTable.websiteId, liveUserTable.visitorId],
        set: {
          last_seen: safeLastSeen,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          countryCode: geo.countryCode,
          lat: geo.lat,
          lng: geo.lng,
          device,
          os,
          browser,
        },
      });

    // Nothing else deletes these rows, so prune while we are already here.
    await db
      .delete(liveUserTable)
      .where(lt(liveUserTable.last_seen, now - STALE_AFTER_MS));

    return NextResponse.json(
      { message: "Data received" },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error("live POST failed:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to record heartbeat" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/* ------------------------ GET: active users ------------------------ */
export async function GET(req: NextRequest) {
  try {
    const websiteId = req.nextUrl.searchParams.get("websiteId");

    if (!websiteId) {
      return NextResponse.json(
        { message: "Missing websiteId" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // The route has to be public so the tracking script can POST heartbeats,
    // which means this read has to authorize itself: live visitors include
    // city and coordinates, so only the website's owner may list them.
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [website] = await db
      .select({ id: websitesTable.id })
      .from(websitesTable)
      .where(
        and(
          eq(websitesTable.websiteId, websiteId),
          eq(websitesTable.userEmail, email)
        )
      )
      .limit(1);

    if (!website) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const activeUsers = await db
      .select()
      .from(liveUserTable)
      .where(
        and(
          eq(liveUserTable.websiteId, websiteId),
          gt(liveUserTable.last_seen, Date.now() - LIVE_WINDOW_MS)
        )
      );

    return NextResponse.json(activeUsers, { headers: corsHeaders() });
  } catch (err: any) {
    console.error("live GET failed:", err);
    return NextResponse.json([], { status: 500, headers: corsHeaders() });
  }
}
