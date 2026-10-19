export type WebsiteType = {
    id: number;
    websiteId: string;
    domain: string;
    timezone: string;
    enableLocalHostTracking: boolean;
    userEmail: string;
};

export type WebsiteInfoType = {
    website: WebsiteType,
    analytics: AnalyticsType
}

export type AnalyticsType = {
    avgActiveTime: number;
    totalActiveTime: number;
    totalSessions: number;
    totalVisitors: number;
    hourlyVisitors: HourlyVisitorsType[];
    dailyVisitors: DailyVisitorsType[];
    referrals:ReferralsType[]
    refParams: RefParamsType[]
    cities: CityType[],
    countries: CountryType[],
    regions: RegionType[],
    devices:DeviceType[],
    browsers:BrowserType[],
    os:OSType[],
    last24hVisitors:number
}

export type CityType={
    name:string;
    uv: number;
    image: string;
    code: string;
}

export type CountryType={
    name:string;
    uv: number;
    image: string;
    code: string;
}

export type RegionType={
    name:string;
    uv: number;
    image: string;
    code: string;
}

export type DeviceType={
    name:string;
    uv: number;
}

export type BrowserType={
    name:string;
    uv: number;
}

export type OSType={
    name:string;
    uv: number;
}

export type ReferralsType={
    domainName:string;
    uv: number;
    name: string;
}

export type RefParamsType={
    name:string;
    uv: number;
}


export type HourlyVisitorsType={
    count: number;
    date: string;
    hour: number;
    hourLabel: string;
}

export type DailyVisitorsType={
    date: string;
    count: number;
}

export type LiveUserType={
    visitorId:string;
    websiteId:string;
}

export const IMAGE_URL_FOR_DOMAINS='https://icons.duckduckgo.com/ip3/<domain>.com.ico';