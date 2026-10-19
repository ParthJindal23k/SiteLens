export type GeoInfo = {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: string | null;
  lng: string | null;
};

const UNKNOWN_GEO: GeoInfo = {
  city: "Unknown",
  region: "Unknown",
  country: "Unknown",
  countryCode: "Unknown",
  lat: null,
  lng: null,
};

const LOOPBACK_OR_PRIVATE =
  /^(?:127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|::1$|fc00:|fd00:|localhost$)/i;

export function isPrivateAddress(ip: string | null): boolean {
  return !ip || LOOPBACK_OR_PRIVATE.test(ip);
}

export function getClientIp(req: Request): string | null {
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return req.headers.get("x-real-ip");
}

/**
 * Resolves an IP to a coarse location, falling back to "Unknown" on every
 * failure path so a geo outage can never fail an ingestion request.
 *
 * ip-api.com's free tier is HTTP-only and capped at 45 requests/minute, so
 * rate-limited responses (`status: "fail"`) are expected under load and are
 * treated as unknown rather than as an error.
 */
export async function lookupGeo(ip: string | null): Promise<GeoInfo> {
  if (isPrivateAddress(ip)) return UNKNOWN_GEO;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`, {
      signal: AbortSignal.timeout(2500),
    });

    if (!res.ok) return UNKNOWN_GEO;

    const data = await res.json();
    if (data?.status !== "success") return UNKNOWN_GEO;

    return {
      city: data.city || "Unknown",
      region: data.regionName || "Unknown",
      country: data.country || "Unknown",
      countryCode: data.countryCode ? String(data.countryCode).toUpperCase() : "Unknown",
      lat: data.lat != null ? String(data.lat) : null,
      lng: data.lon != null ? String(data.lon) : null,
    };
  } catch {
    return UNKNOWN_GEO;
  }
}
