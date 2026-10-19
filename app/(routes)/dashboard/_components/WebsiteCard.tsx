import React, { useMemo } from "react";
import Link from "next/link";
import { Globe, ArrowUpRight } from "lucide-react";
import { Area, AreaChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { WebsiteInfoType } from "@/configs/type";
import { cn } from "@/lib/utils";

type Props = {
  websiteInfo: WebsiteInfoType;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function WebsiteCard({ websiteInfo }: Props) {
  const hourlyData = websiteInfo?.analytics?.hourlyVisitors ?? [];

  const chartData = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return [];

    // if only 1 point, add previous point (0) to make chart feel real
    if (hourlyData.length === 1) {
      const h = Number((hourlyData[0] as any)?.hour ?? 0);
      const prev = Math.max(h - 1, 0);

      return [
        {
          ...(hourlyData[0] as any),
          hour: prev,
          count: 0,
          hourLabel: `${prev}AM/PM`,
        },
        hourlyData[0],
      ];
    }

    return hourlyData;
  }, [hourlyData]);

  const domain =
    websiteInfo?.website?.domain?.replace("https://", "") ?? "Website";

  const visitors = Number(websiteInfo?.analytics?.last24hVisitors ?? 0);

  return (
    <Link href={`/dashboard/website/${websiteInfo?.website?.websiteId}`}>
      <Card
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-card shadow-sm",
          "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md",
          "cursor-pointer"
        )}
      >
        {/* subtle background glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-start justify-between gap-3">
            {/* left */}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                <Globe className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-semibold tracking-tight">
                  {domain}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  Website Analytics
                </p>
              </div>
            </div>

            {/* right */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">View</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Chart wrapper */}
          <div
            className={cn(
              "rounded-2xl border bg-background/60 p-3 shadow-sm",
              "transition-colors group-hover:bg-background/80"
            )}
          >
            <ChartContainer config={chartConfig} className="h-[85px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12, top: 8, bottom: 4 }}
              >
                <Area
                  dataKey="count"
                  type="natural"
                  fill="var(--color-primary)"
                  fillOpacity={0.12}
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Footer metric */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tight">
                {visitors}
              </span>
              <span className="text-sm text-muted-foreground">visitors</span>
            </div>

            <span className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm">
              Last 24h
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default WebsiteCard;
