import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WebsiteInfoType } from "@/configs/type";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type Props = {
  websiteInfo: WebsiteInfoType | undefined | null;
  loading?: boolean;
  analyticType?: string;
  liveUserCount?: number;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/**
 *  Animation helper: counts from `from` to `to`
 */
function animateNumber({
  from,
  to,
  duration,
  onUpdate,
  onDone,
}: {
  from: number;
  to: number;
  duration: number;
  onUpdate: (v: number) => void;
  onDone?: () => void;
}) {
  const startTime = performance.now();
  let rafId = 0;

  const tick = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * eased;

    onUpdate(current);

    if (progress < 1) rafId = requestAnimationFrame(tick);
    else onDone?.();
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null || Number.isNaN(value)) {
    return <span className="text-[11px] text-muted-foreground/70">—</span>;
  }

  const isPositive = value >= 0;
  const abs = Math.abs(value);

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        isPositive
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          : "border-red-500/20 bg-red-500/10 text-red-600",
      ].join(" ")}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {isPositive ? "+" : "-"}
      {abs.toFixed(1)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  loading,
  skeletonWidth = "w-20",
  growth,
}: {
  label: string;
  value: string | number;
  loading: boolean;
  skeletonWidth?: string;
  growth?: number | null;
}) {
  return (
    <div className="rounded-2xl border bg-background/70 p-4 shadow-sm transition-all hover:bg-background/90">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            vs latest (baseline)
          </p>
        </div>
        {typeof growth !== "undefined" && (
          <div className="mt-0.5">
            <GrowthBadge value={growth} />
          </div>
        )}
      </div>

      <div className="mt-2 min-h-[34px]">
        {loading ? (
          <Skeleton className={`h-8 ${skeletonWidth} rounded-md bg-muted/70`} />
        ) : (
          <p className="text-2xl font-semibold leading-none">{value}</p>
        )}
      </div>
    </div>
  );
}

type Phase = "idle" | "countdown" | "skeleton" | "countup";

export default function PageViewAnalytics({
  websiteInfo,
  loading,
  analyticType,
  liveUserCount,
}: Props) {
  const webAnalytic = websiteInfo?.analytics;

  // raw loading from backend/API
  const rawLoading =
    loading ||
    !webAnalytic ||
    webAnalytic.totalVisitors === undefined ||
    webAnalytic.totalSessions === undefined ||
    webAnalytic.totalActiveTime === undefined ||
    webAnalytic.avgActiveTime === undefined;

  //  current dataset (whatever user selected)
  const visitors = useMemo(
    () => Number(webAnalytic?.totalVisitors ?? 0),
    [webAnalytic?.totalVisitors]
  );

  const pageViews = useMemo(
    () => Number(webAnalytic?.totalSessions ?? 0),
    [webAnalytic?.totalSessions]
  );

  const totalActiveMins = useMemo(
    () => Number(webAnalytic?.totalActiveTime ?? 0) / 60,
    [webAnalytic?.totalActiveTime]
  );

  const avgActiveMins = useMemo(
    () => Number(webAnalytic?.avgActiveTime ?? 0) / 60,
    [webAnalytic?.avgActiveTime]
  );

  /**
   * GLOBAL baseline snapshot:
   * stores FIRST successful dataset as "latest/current"
   */
  const latestSnapshotRef = useRef<null | {
    visitors: number;
    pageViews: number;
    totalActiveMins: number;
    avgActiveMins: number;
  }>(null);

  const hasSavedLatestRef = useRef(false);

  //  save only once when first real dataset arrives
  useEffect(() => {
    if (!rawLoading && !hasSavedLatestRef.current) {
      latestSnapshotRef.current = {
        visitors,
        pageViews,
        totalActiveMins,
        avgActiveMins,
      };
      hasSavedLatestRef.current = true;
    }
  }, [rawLoading, visitors, pageViews, totalActiveMins, avgActiveMins]);

  /**
   * growth is always calculated like:
   * baseline = selected range
   * current  = latestSnapshot(first load)
   */
  const growth = useMemo(() => {
    const latest = latestSnapshotRef.current;
    if (!latest) {
      return {
        visitors: null,
        pageViews: null,
        totalActive: null,
        avgActive: null,
      };
    }

    const calc = (baseline: number, current: number) => {
      if (baseline === 0) return null;
      return ((current - baseline) / baseline) * 100;
    };

    return {
      visitors: calc(visitors, latest.visitors),
      pageViews: calc(pageViews, latest.pageViews),
      totalActive: calc(totalActiveMins, latest.totalActiveMins),
      avgActive: calc(avgActiveMins, latest.avgActiveMins),
    };
  }, [visitors, pageViews, totalActiveMins, avgActiveMins]);

  /**
   *  Trigger key for animations
   */
  const resetKey = useMemo(() => `${analyticType}-${visitors}-${pageViews}-${totalActiveMins}-${avgActiveMins}`, [
    analyticType,
    visitors,
    pageViews,
    totalActiveMins,
    avgActiveMins,
  ]);

  //  UI phase controller
  const [phase, setPhase] = useState<Phase>(rawLoading ? "skeleton" : "idle");
  const displayLoading = phase === "skeleton";

  //  Animated display values
  const [visitorsDisplay, setVisitorsDisplay] = useState(0);
  const [pageViewsDisplay, setPageViewsDisplay] = useState(0);
  const [totalActiveDisplay, setTotalActiveDisplay] = useState(0);
  const [avgActiveDisplay, setAvgActiveDisplay] = useState(0);

  const displayRef = useRef({
    visitors: 0,
    pageViews: 0,
    totalActive: 0,
    avgActive: 0,
  });

  useEffect(() => {
    displayRef.current = {
      visitors: visitorsDisplay,
      pageViews: pageViewsDisplay,
      totalActive: totalActiveDisplay,
      avgActive: avgActiveDisplay,
    };
  }, [visitorsDisplay, pageViewsDisplay, totalActiveDisplay, avgActiveDisplay]);

  /**
   * Start countdown on refresh/reset
   */
  useEffect(() => {
    if (rawLoading && phase !== "skeleton" && phase !== "countdown") {
      setPhase("countdown");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawLoading]);

  /**
   * Phase machine
   */
  useEffect(() => {
    let cleanupFns: Array<() => void> = [];
    let timeoutId: any;

    if (phase === "countdown") {
      const start = displayRef.current;

      cleanupFns.push(
        animateNumber({
          from: start.visitors,
          to: 0,
          duration: 650,
          onUpdate: setVisitorsDisplay,
        })
      );
      cleanupFns.push(
        animateNumber({
          from: start.pageViews,
          to: 0,
          duration: 650,
          onUpdate: setPageViewsDisplay,
        })
      );
      cleanupFns.push(
        animateNumber({
          from: start.totalActive,
          to: 0,
          duration: 650,
          onUpdate: setTotalActiveDisplay,
        })
      );
      cleanupFns.push(
        animateNumber({
          from: start.avgActive,
          to: 0,
          duration: 650,
          onUpdate: setAvgActiveDisplay,
          onDone: () => setPhase("skeleton"),
        })
      );
    }

    if (phase === "skeleton") {
      if (!rawLoading) {
        timeoutId = setTimeout(() => setPhase("countup"), 220);
      }
    }

    if (phase === "countup") {
      cleanupFns.push(
        animateNumber({ from: 0, to: visitors, duration: 650, onUpdate: setVisitorsDisplay })
      );
      cleanupFns.push(
        animateNumber({ from: 0, to: pageViews, duration: 650, onUpdate: setPageViewsDisplay })
      );
      cleanupFns.push(
        animateNumber({ from: 0, to: totalActiveMins, duration: 650, onUpdate: setTotalActiveDisplay })
      );
      cleanupFns.push(
        animateNumber({
          from: 0,
          to: avgActiveMins,
          duration: 650,
          onUpdate: setAvgActiveDisplay,
          onDone: () => setPhase("idle"),
        })
      );
    }

    return () => {
      cleanupFns.forEach((fn) => fn());
      clearTimeout(timeoutId);
    };
  }, [phase, rawLoading, resetKey, visitors, pageViews, totalActiveMins, avgActiveMins]);

  // Chart Data
  const chartData =
    analyticType === "hourly"
      ? webAnalytic?.hourlyVisitors
      : webAnalytic?.dailyVisitors;

  const xKey = analyticType === "hourly" ? "hourLabel" : "date";
  const chartTitle =
    analyticType === "hourly" ? "Hourly Visitors" : "Daily Visitors";

  return (
    <div className="mt-7">
      <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border bg-background p-2 shadow-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Overview of visitor engagement
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-20" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium">Live</span>
              <span className="text-sm text-muted-foreground">
                {liveUserCount ?? 0} users
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard
              label="Visitors"
              value={Math.round(visitorsDisplay).toString()}
              loading={displayLoading}
              growth={growth.visitors}
              skeletonWidth="w-14"
            />
            <StatCard
              label="Total Page Views"
              value={Math.round(pageViewsDisplay).toString()}
              loading={displayLoading}
              growth={growth.pageViews}
              skeletonWidth="w-16"
            />
            <StatCard
              label="Total Active Time"
              value={`${totalActiveDisplay.toFixed(1)} mins`}
              loading={displayLoading}
              growth={growth.totalActive}
              skeletonWidth="w-20"
            />
            <StatCard
              label="Avg Active Time"
              value={`${avgActiveDisplay.toFixed(1)} mins`}
              loading={displayLoading}
              growth={growth.avgActive}
              skeletonWidth="w-20"
            />
          </div>
        </CardContent>

        <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{chartTitle}</p>
              <p className="text-xs text-muted-foreground">
                {analyticType === "hourly"
                  ? "Last 24 hours performance"
                  : "Recent activity trend"}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {analyticType === "hourly" ? "Hourly" : "Daily"}
            </div>
          </div>

          <div className="relative rounded-2xl border bg-background/70 p-3 sm:p-4 shadow-sm">
            {displayLoading ? (
              <Skeleton className="h-[260px] sm:h-[340px] w-full rounded-xl bg-muted/70" />
            ) : (
              <ChartContainer
                config={chartConfig}
                className="h-[260px] sm:h-[340px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ left: 10, right: 10, top: 12, bottom: 6 }}
                >
                  <CartesianGrid vertical={false} opacity={0.25} />
                  <XAxis
                    dataKey={xKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    fontSize={12}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="count"
                    type="monotone"
                    fill="var(--color-primary)"
                    fillOpacity={0.25}
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
