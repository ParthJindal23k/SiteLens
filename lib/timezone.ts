/**
 * Timezone options offered when adding a website.
 *
 * These must be IANA zone names. Earlier versions of the form stored
 * abbreviations such as "pst", which `Intl.DateTimeFormat` rejects, so every
 * affected website silently fell back to UTC and bucketed its charts in the
 * wrong timezone.
 */
export const TIMEZONE_GROUPS: {
  label: string;
  zones: { value: string; label: string }[];
}[] = [
  {
    label: "North America",
    zones: [
      { value: "America/New_York", label: "Eastern Time (ET)" },
      { value: "America/Chicago", label: "Central Time (CT)" },
      { value: "America/Denver", label: "Mountain Time (MT)" },
      { value: "America/Phoenix", label: "Arizona (MST, no DST)" },
      { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
      { value: "America/Anchorage", label: "Alaska Time (AKT)" },
      { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "America/Mexico_City", label: "Mexico City" },
    ],
  },
  {
    label: "Europe & Africa",
    zones: [
      { value: "UTC", label: "Coordinated Universal Time (UTC)" },
      { value: "Europe/London", label: "London (GMT/BST)" },
      { value: "Europe/Lisbon", label: "Lisbon (WET/WEST)" },
      { value: "Europe/Paris", label: "Central European Time (CET)" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Athens", label: "Eastern European Time (EET)" },
      { value: "Europe/Moscow", label: "Moscow Time (MSK)" },
      { value: "Africa/Lagos", label: "West Africa Time (WAT)" },
      { value: "Africa/Harare", label: "Central Africa Time (CAT)" },
      { value: "Africa/Nairobi", label: "East Africa Time (EAT)" },
      { value: "Africa/Johannesburg", label: "South Africa Time (SAST)" },
    ],
  },
  {
    label: "Asia",
    zones: [
      { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
      { value: "Asia/Karachi", label: "Pakistan Standard Time (PKT)" },
      { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
      { value: "Asia/Dhaka", label: "Bangladesh Standard Time (BST)" },
      { value: "Asia/Bangkok", label: "Indochina Time (ICT)" },
      { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
      { value: "Asia/Makassar", label: "Indonesia Central Time (WITA)" },
      { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
      { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
      { value: "Asia/Seoul", label: "Korea Standard Time (KST)" },
    ],
  },
  {
    label: "Australia & Pacific",
    zones: [
      { value: "Australia/Perth", label: "Australian Western Time (AWST)" },
      { value: "Australia/Darwin", label: "Australian Central Time (ACST)" },
      { value: "Australia/Sydney", label: "Australian Eastern Time (AEST)" },
      { value: "Pacific/Auckland", label: "New Zealand Time (NZST)" },
      { value: "Pacific/Fiji", label: "Fiji Time (FJT)" },
    ],
  },
  {
    label: "South America",
    zones: [
      { value: "America/Argentina/Buenos_Aires", label: "Argentina Time (ART)" },
      { value: "America/La_Paz", label: "Bolivia Time (BOT)" },
      { value: "America/Sao_Paulo", label: "Brasilia Time (BRT)" },
      { value: "America/Santiago", label: "Chile Time (CLT)" },
      { value: "America/Bogota", label: "Colombia Time (COT)" },
    ],
  },
];

/**
 * Repairs the abbreviations written by the old timezone select so websites
 * created before the fix keep reporting in their intended zone instead of UTC.
 */
const LEGACY_ABBREVIATION_ALIASES: Record<string, string> = {
  est: "America/New_York",
  cst: "America/Chicago",
  mst: "America/Denver",
  pst: "America/Los_Angeles",
  akst: "America/Anchorage",
  hst: "Pacific/Honolulu",
  gmt: "Europe/London",
  cet: "Europe/Paris",
  eet: "Europe/Athens",
  west: "Europe/Lisbon",
  cat: "Africa/Harare",
  eat: "Africa/Nairobi",
  msk: "Europe/Moscow",
  ist: "Asia/Kolkata",
  cst_china: "Asia/Shanghai",
  jst: "Asia/Tokyo",
  kst: "Asia/Seoul",
  ist_indonesia: "Asia/Makassar",
  awst: "Australia/Perth",
  acst: "Australia/Darwin",
  aest: "Australia/Sydney",
  nzst: "Pacific/Auckland",
  fjt: "Pacific/Fiji",
  art: "America/Argentina/Buenos_Aires",
  bot: "America/La_Paz",
  brt: "America/Sao_Paulo",
  clt: "America/Santiago",
};

export function resolveTimeZone(timezone?: string | null): string {
  if (!timezone) return "UTC";

  const candidate =
    LEGACY_ABBREVIATION_ALIASES[timezone.trim().toLowerCase()] ?? timezone;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch {
    return "UTC";
  }
}

export function isValidTimeZone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
