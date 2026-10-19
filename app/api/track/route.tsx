import { db } from "@/configs/db";
import { pageViewTable } from "@/configs/schema";
import { getClientIp, lookupGeo } from "@/lib/geo";
import { authorizeIngest, corsHeaders } from "@/lib/ingest";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

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

    /* ---------- Exit: close out the visitor's most recent entry ---------- */
    if (body.type !== "entry") {
      const [latestEntry] = await db
        .select({ id: pageViewTable.id })
        .from(pageViewTable)
        .where(
          and(
            eq(pageViewTable.websiteId, website.websiteId),
            eq(pageViewTable.visitorId, body.visitorId),
            eq(pageViewTable.type, "entry")
          )
        )
        .orderBy(desc(pageViewTable.id))
        .limit(1);

      if (!latestEntry) {
        return NextResponse.json(
          { message: "No matching entry event" },
          { status: 202, headers: corsHeaders() }
        );
      }

      // Scoped to a single row by primary key. Matching on visitorId alone
      // would stamp this exit onto every pageview in the visitor's 12-hour
      // session and inflate the active-time totals.
      await db
        .update(pageViewTable)
        .set({
          exitTime: body.exitTime ? String(body.exitTime) : null,
          totalActiveTime: Number(body.totalActiveTime) || 0,
          exitUrl: body.exitUrl,
        })
        .where(eq(pageViewTable.id, latestEntry.id));

      return NextResponse.json(
        { message: "Exit recorded" },
        { headers: corsHeaders() }
      );
    }

    /* ---------- Entry: enrich and insert ---------- */
    const parser = new UAParser(req.headers.get("user-agent") || "");
    const ip = getClientIp(req);
    const geo = await lookupGeo(ip);

    const [inserted] = await db
      .insert(pageViewTable)
      .values({
        websiteId: website.websiteId,
        domain: website.domain,
        url: body.url,
        type: "entry",
        referrer: body.referrer,
        visitorId: body.visitorId,
        entryTime: body.entryTime ? String(body.entryTime) : null,
        exitTime: null,
        totalActiveTime: 0,
        urlParams: body.urlParams,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        device: parser.getDevice().type || "Unknown",
        os: parser.getOS().name || "Unknown",
        browser: parser.getBrowser().name || "Unknown",
        city: geo.city,
        region: geo.region,
        country: geo.country,
        countryCode: geo.countryCode,
        ipAddress: ip ?? "Unknown",
        refParams: body.refParams,
      })
      .returning();

    return NextResponse.json(
      { message: "Data received", data: inserted },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error("track POST failed:", err);
    return NextResponse.json(
      { status: "error", message: "Failed to record event" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
