import { sql } from "drizzle-orm";
import {
    bigint,
    boolean,
    index,
    integer,
    pgTable,
    unique,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
});

export const websitesTable = pgTable(
    "websites",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        websiteId: uuid("websiteId").notNull().unique(),
        domain: varchar({ length: 255 }).notNull(),
        timezone: varchar({ length: 100 }).notNull(),
        enableLocalHostTracking: boolean().default(false),
        userEmail: varchar({ length: 255 }).notNull(),
    },
    (table) => [
        // A domain is unique per owner, not globally: two customers may each
        // legitimately track the same domain.
        unique("websites_domain_user_email_unique").on(
            table.domain,
            table.userEmail
        ),
        index("websites_user_email_idx").on(table.userEmail),
    ]
);

export const pageViewTable = pgTable(
    "pageViews",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        websiteId: uuid("websiteId").notNull(),
        domain: varchar({ length: 255 }).notNull(),
        url: varchar({ length: 2048 }),
        type: varchar({ length: 50 }).notNull(),
        referrer: varchar({ length: 2048 }),
        visitorId: varchar({ length: 255 }),
        entryTime: varchar({ length: 100 }),
        exitTime: varchar({ length: 100 }),
        totalActiveTime: integer(),
        urlParams: varchar(),
        utm_source: varchar({ length: 255 }),
        utm_medium: varchar({ length: 255 }),
        utm_campaign: varchar({ length: 255 }),
        device: varchar(),
        os: varchar(),
        browser: varchar(),
        city: varchar(),
        region: varchar(),
        country: varchar(),
        countryCode: varchar(),
        ipAddress: varchar(),
        refParams: varchar(),
        exitUrl: varchar(),
    },
    (table) => [
        index("page_views_website_id_idx").on(table.websiteId),
        // Exit events look up the visitor's most recent entry row.
        index("page_views_website_visitor_idx").on(
            table.websiteId,
            table.visitorId
        ),
        // entryTime stores a unix timestamp in a varchar column, and the
        // analytics range filter compares it as a bigint. The index has to
        // match that expression or the planner cannot use it.
        index("page_views_entry_time_idx").using(
            "btree",
            sql`(("entryTime")::bigint)`
        ),
    ]
);

export const liveUserTable = pgTable(
    "liveUser",
    {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),
        websiteId: varchar().notNull(),
        visitorId: varchar().notNull(),
        // Unix milliseconds. Stored as a number so the freshness window can be
        // compared numerically instead of lexicographically.
        last_seen: bigint({ mode: "number" }).notNull(),
        city: varchar(),
        region: varchar(),
        country: varchar(),
        countryCode: varchar(),
        lat: varchar(),
        lng: varchar(),
        device: varchar(),
        os: varchar(),
        browser: varchar(),
    },
    (table) => [
        // A visitor can be active on several tracked sites at once, so identity
        // is (website, visitor) rather than visitor alone.
        unique("live_user_website_visitor_unique").on(
            table.websiteId,
            table.visitorId
        ),
        index("live_user_website_last_seen_idx").on(
            table.websiteId,
            table.last_seen
        ),
    ]
);
