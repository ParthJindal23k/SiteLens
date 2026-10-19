"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Code2,
  Globe2,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Cpu,
  Bot,
  Zap,
  MonitorSmartphone,
  MapPin,
  Layers,
  Gauge,
  ChevronRight,
} from "lucide-react";
import ToggleTheme from "./_components/ToggleTheme";

/* -------------------------------------------
   PARALLAX HOOK (mouse-based)
-------------------------------------------- */
function useMouseParallax() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.3 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.3 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x);
      my.set(y);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return { sx, sy };
}

/* -------------------------------------------
   BACKGROUND: floating stats, orbit chips, graphs
-------------------------------------------- */
const FLOWING_STATS = [
  "Visitors 42,390",
  "+12.4% Growth",
  "Pageviews 128,904",
  "Avg 3m 42s",
  "Bounce 32%",
  "Live 312",
  "CTR 4.8%",
  "Sessions 92k",
  "Privacy-first",
  "No Cookies",
  "GDPR ✓",
  "Mobile 62%",
  "Desktop 34%",
  "Chrome 61%",
  "Safari 19%",
  "IN 43%",
  "US 18%",
  "EU 21%",
  "Script 6KB",
  "Realtime",
];

/**
 * Visible orbit drift chips
 * - move in BOTH x and y
 * - subtle blur
 * - visible opacity
 */
function OrbitChip({ text, index }: { text: string; index: number }) {
  const duration = 18 + (index % 6) * 3;
  const delay = (index % 6) * 0.22;

  const left = (index * 17) % 100;
  const top = (index * 9) % 90;

  const dir = index % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${left}%`, top: `${top}%` }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, dir * 54, dir * -34, 0],
        y: [0, dir * -26, dir * 40, 0],
      }}
      transition={{
        duration: Math.max(14, duration - 4), // faster
        delay: delay * 0.35, // load quicker
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="
  rounded-full border border-white/20 bg-white/12
  px-3 py-1 text-[12px] text-white/90
  backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.09)]
"
        style={{ filter: "blur(0.15px)" }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function MiniGraph({ index }: { index: number }) {
  const series = [
    [12, 18, 12, 26, 20, 38, 34, 48],
    [18, 30, 22, 44, 38, 60, 54, 72],
    [26, 18, 34, 26, 48, 40, 62, 54],
    [22, 38, 28, 52, 44, 58, 66, 78],
  ][index % 4];

  const x0 = 14;
  const step = 20;

  const path = series
    .map((y, i) => `${i === 0 ? "M" : "L"} ${x0 + i * step} ${112 - y}`)
    .join(" ");

  const left = (index * 21) % 100;
  const top = ((index * 29) % 70) + 8;

  return (
    <motion.div
      className="pointer-events-none absolute hidden md:block"
      style={{ left: `${left}%`, top: `${top}%` }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.4, 0.35, 0],
        y: [0, -14, 10, 0],
      }}
      transition={{
        duration: 20,
        delay: (index % 6) * 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="relative h-[140px] w-[240px] rounded-2xl border border-white/12 bg-white/6 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <svg width="240" height="140" viewBox="0 0 240 140">
            <defs>
              <linearGradient id={`g-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(99,102,241,0.65)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.55)" />
              </linearGradient>
            </defs>

            <path
              d={path}
              fill="none"
              stroke={`url(#g-${index})`}
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            <path
              d={`${path} L ${
                x0 + (series.length - 1) * step
              } 140 L ${x0} 140 Z`}
              fill="rgba(99,102,241,0.12)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main Background
 * - layered gradients
 * - soft grid
 * - visible floating stats + graphs
 * - parallax movement
 */
function AnalyticsBackground() {
  const { sx, sy } = useMouseParallax();

  // Parallax transforms for layers
  const bgX = useTransform(sx, [-1, 1], [-26, 26]);
  const bgY = useTransform(sy, [-1, 1], [-18, 18]);

  const midX = useTransform(sx, [-1, 1], [-40, 40]);
  const midY = useTransform(sy, [-1, 1], [-28, 28]);

  const topX = useTransform(sx, [-1, 1], [-70, 70]);
  const topY = useTransform(sy, [-1, 1], [-50, 50]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <motion.div className="absolute inset-0" style={{ x: bgX, y: bgY }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.23),transparent_58%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.18),transparent_58%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/78 to-neutral-950" />
      </motion.div>

      {/* Soft grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]"
        style={{ x: midX, y: midY }}
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </motion.div>

      {/* Floating chips */}
      <motion.div className="absolute inset-0" style={{ x: topX, y: topY }}>
        {FLOWING_STATS.map((t, i) => (
          <OrbitChip key={i} text={t} index={i} />
        ))}
      </motion.div>

      {/* Floating mini graphs */}
      <motion.div className="absolute inset-0" style={{ x: midX, y: midY }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <MiniGraph key={i} index={i} />
        ))}
      </motion.div>

      {/* Fade bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[260px] bg-gradient-to-t from-neutral-950 to-transparent" />
    </div>
  );
}

/* -------------------------------------------
   UI BLOCKS
-------------------------------------------- */
function MetricCard({
  title,
  value,
  change,
  suffix,
}: {
  title: string;
  value: string;
  change: number;
  suffix?: string;
}) {
  const positive = change >= 0;

  return (
    <div className="rounded-2xl border border-white/12 bg-white/6 p-6 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      <p className="text-sm text-white/60">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          {value}
        </h3>
        {suffix && <span className="text-sm text-white/50">{suffix}</span>}
      </div>

      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${
          positive
            ? "border-emerald-500/25 bg-emerald-500/12 text-emerald-200"
            : "border-red-500/25 bg-red-500/12 text-red-200"
        }`}
      >
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(change)}%
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className="
    rounded-2xl border
    border-neutral-200/80 dark:border-white/12
    bg-neutral-50/80 dark:bg-white/6
    p-6
    shadow-[0_1px_0_rgba(0,0,0,0.04)]
    hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]
    dark:hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]
    transition-shadow
  "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="
        grid h-11 w-11 place-items-center rounded-2xl border
        border-neutral-200/80 dark:border-white/12
        bg-white dark:bg-white/8
        shadow-sm
      "
        >
          {icon}
        </div>

        {badge && (
          <span
            className="
          rounded-full border
          border-neutral-200/80 dark:border-white/12
          bg-white dark:bg-white/10
          px-2 py-0.5 text-[11px] font-medium
          text-neutral-700 dark:text-white/80
        "
          >
            {badge}
          </span>
        )}
      </div>

      {/* ✅ Higher contrast title */}
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-950 dark:text-black/90">
        {title}
      </h3>

      {/* ✅ Higher contrast description */}
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-black/75">
        {desc}
      </p>
    </motion.div>
  );
}

function PricingCard({
  title,
  price,
  subtitle,
  features,
  highlight,
  cta,
  href,
}: {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: string;
  cta: string;
  href: string;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border p-6",
        "border-white/12",
        "bg-white/[0.06] backdrop-blur-xl",
        "shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
        highlight
          ? "ring-1 ring-indigo-500/30"
          : "",
      ].join(" ")}
    >
      {highlight && (
        <div
          className="
            absolute -top-3 left-5 rounded-full border
            border-indigo-400/30 bg-indigo-500/20
            px-3 py-1 text-[11px] font-semibold text-indigo-100
            backdrop-blur
          "
        >
          {highlight}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        </div>

        <Sparkles className="h-5 w-5 text-indigo-300" />
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {price}
        </span>
        <span className="pb-1 text-sm text-white/60">/month</span>
      </div>

      <div className="mt-5 space-y-2">
        {features.map((f, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500/12 text-emerald-300">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-white/80">{f}</span>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
          highlight
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : "border border-white/12 bg-white/5 text-white hover:bg-white/10",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}


/* -------------------------------------------
   FAKE DASHBOARD PREVIEW (hero)
-------------------------------------------- */
function FakeDashboardPreview() {
  const metrics = [
    { label: "Visitors", value: "20", change: -95.0 },
    { label: "Total Page Views", value: "194", change: -96.9 },
    { label: "Total Active Time", value: "85.1 mins", change: +12.3 },
    { label: "Avg Active Time", value: "42.7 mins", change: +8.6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
      className="relative mx-auto mt-12 w-full max-w-6xl"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-white/14 bg-neutral-950/70 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        {/* glow */}
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-[340px] w-[340px] rounded-full bg-violet-500/22 blur-3xl" />

        {/* Mac top bar */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/95" />
            <span className="h-3 w-3 rounded-full bg-amber-300/95" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/95" />
          </div>

          <div className="text-[12px] font-medium text-white/65">
            Sitelens • Analytics
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-1 text-[11px] text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        {/* Dashboard content */}
        <div className="relative p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white/95">
                Analytics
              </div>
              <div className="text-xs text-white/65 mt-1">
                Overview of visitor engagement
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-1.5 text-xs text-white/80">
              Hourly
            </div>
          </div>

          {/* Metric cards */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m, idx) => {
              const positive = m.change >= 0;

              return (
                <div
                  key={idx}
                  className="
                    rounded-2xl border border-white/12
                    bg-white/[0.06]
                    p-4
                    shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]
                  "
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[12px] text-white/72">{m.label}</div>
                      <div className="text-[11px] text-white/50 mt-1">
                        vs baseline
                      </div>
                    </div>

                    <div
                      className={[
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        positive
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                          : "border-red-500/30 bg-red-500/10 text-red-200",
                      ].join(" ")}
                    >
                      {positive ? "+" : "-"}
                      {Math.abs(m.change).toFixed(1)}%
                    </div>
                  </div>

                  {/* ✅ HIGH contrast value */}
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white/95">
                    {m.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.06] p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-white/95">
                  Hourly Visitors
                </div>
                <div className="text-xs text-white/65 mt-1">
                  Last 24 hours performance
                </div>
              </div>

              <div className="text-xs text-white/70">Hourly</div>
            </div>

            {/* Curved chart */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-white/5 p-3">
              <svg width="100%" height="240" viewBox="0 0 900 240">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <linearGradient id="smoothLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.65)" />
                  </linearGradient>
                </defs>

                {/* baseline */}
                <path
                  d="M20 205 L880 205"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="2"
                />

                {/* ✅ CURVED smooth path */}
                <path
                  d="
                    M20 205
                    C 70 205, 95 205, 130 205
                    C 150 205, 160 160, 180 150
                    C 200 140, 220 205, 250 205
                    C 310 205, 330 205, 360 205
                    C 380 205, 390 120, 420 110
                    C 450 100, 470 205, 510 205
                    C 560 205, 590 70, 610 55
                    C 625 45, 640 140, 660 120
                    C 680 100, 700 205, 740 205
                    C 790 205, 810 150, 835 130
                    C 860 110, 875 205, 880 205
                  "
                  fill="none"
                  stroke="url(#smoothLine)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[140px] bg-gradient-to-t from-neutral-950/70 to-transparent" />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------
   LANDING PAGE
-------------------------------------------- */
export default function Home() {
  const { user } = useUser();

  const features = useMemo(
    () => [
      {
        icon: <Zap className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />,
        title: "Instant analytics at a glance",
        desc: "Understand traffic, sessions, live users and engagement in seconds with a fast, premium dashboard.",
      },
      {
        icon: (
          <Code2 className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "One-line install (developer friendly)",
        desc: "Add a single script tag. Works with Next.js, React, HTML, WordPress — anything. No setup hassle.",
      },
      {
        icon: (
          <ShieldCheck className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Privacy-first analytics",
        desc: "No cookies. No fingerprinting. GDPR-friendly by design. Get insights without tracking bloat.",
      },
      {
        icon: (
          <MonitorSmartphone className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Device + Browser insights",
        desc: "See traffic split across mobile/desktop/tablet and understand browser + OS usage instantly.",
      },
      {
        icon: (
          <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Geo analytics (region/country)",
        desc: "Know where your visitors come from with location intelligence for targeting & growth.",
      },
      {
        icon: (
          <Layers className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Multi-website management",
        desc: "Perfect for founders & agencies: add multiple websites, separate dashboards, settings and scripts.",
      },
      {
        icon: (
          <BarChart3 className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Smart visual dashboards",
        desc: "Charts & graphs that make trends obvious. Minimal UI, fast loading, and dark-mode friendly.",
      },
      {
        icon: (
          <Gauge className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        ),
        title: "Performance & reliability",
        desc: "Optimized storage + queries, lightweight tracking script, secure backend — built for scale.",
      },
      {
        icon: <Bot className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />,
        title: "AI insights (Coming soon)",
        desc: "Ask: “When was peak traffic yesterday?” or “Which day had most users?” and get instant summaries.",
        badge: "Pro • Coming soon",
      },
    ],
    []
  );

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      {/* Premium moving analytics background */}
      <AnalyticsBackground />

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-3 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo2.png"
              alt="Sitelens"
              width={36}
              height={36}
              className="rounded-lg ring-1 ring-white/10"
              priority
            />
            <div className="leading-none">
              <div className="text-[15px] font-semibold tracking-tight">
                Sitelens
              </div>
              <div className="hidden sm:block text-[11px] text-white/60 mt-1">
                Analytics that make sense
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ToggleTheme />

            <Link
              href="/dashboard/pricing"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
            >
              <Sparkles className="h-4 w-4 text-indigo-300" />
              Pro Subscription
            </Link>

            {!user ? (
              <SignInButton mode="modal" signUpForceRedirectUrl="/dashboard">
                <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition">
                  Get Started
                </button>
              </SignInButton>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 rounded-full ring-1 ring-white/10 shadow-sm",
                  },
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight"
          >
            Analytics that reveal{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-sky-300 to-violet-300">
              insights, trends & growth
            </span>
          </motion.h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/70">
            Track visitors, visualize charts, monitor live users, and measure
            growth — without cookies or tracking bloat. Built for modern SaaS.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition"
            >
              Start Tracking Free
            </Link>
            <Link
              href="/dashboard/pricing"
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 hover:bg-white/10 transition"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* trust pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              🚫 No cookies
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ✅ GDPR-friendly
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ⚡ Lightweight
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              🔌 One script install
            </span>
          </div>

          {/* Fake dashboard preview */}
          <FakeDashboardPreview />
        </div>
      </section>

      {/* METRICS */}
      <section className="relative">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Visitors" value="42,390" change={12.4} />
            <MetricCard title="Page Views" value="128,904" change={6.1} />
            <MetricCard title="Live Users" value="312" change={3.2} />
            <MetricCard title="Avg Session" value="3m 42s" change={9.3} />
          </div>
        </div>
      </section>

      {/* SMOOTH TRANSITION (no sharp cut) */}
      <div className="relative h-20">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-white" />
      </div>

      {/* FEATURES (light section) */}
      <section className="relative bg-white text-neutral-900">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest text-indigo-600">
                FEATURES
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
                Everything you need for modern web analytics
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-600">
                Visual dashboards, realtime tracking, geo + device intelligence,
                multi-website management, and pro subscriptions — built with a
                premium UI and privacy-first philosophy.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-2 rounded-full border bg-neutral-50 px-4 py-2">
                <Cpu className="h-4 w-4 text-indigo-600" />
                Built for performance
              </span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => (
              <FeatureCard
                key={idx}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                badge={(f as any).badge}
              />
            ))}
          </div>

          {/* One-line setup */}
          <div className="mt-14 rounded-2xl border bg-neutral-50 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-widest text-indigo-600">
                  ONE-LINE SETUP
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Add one script. Start tracking instantly.
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Works with any framework. Auto-detects domain & website.
                  Extremely lightweight — no performance impact.
                </p>

                <Link
                  href="/dashboard/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
                >
                  Add Website
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="flex-1">
                <pre className="relative overflow-hidden rounded-2xl border bg-neutral-900 p-5 text-sm text-green-300 shadow-sm">
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.42),transparent_58%)]" />
                  <code className="relative">
                    {`<script
  defer
  data-website-id="YOUR_WEBSITE_ID"
  data-domain="yourdomain.com"
  src="https://sitelens.app/analytics.js">
</script>`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMOOTH TRANSITION BACK */}
      <div className="relative h-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-neutral-950" />
      </div>

      {/* PRICING */}
      <section className="relative">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-16 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-indigo-300">
              PRICING
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
              Simple subscription. Premium insights.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              Start free. Upgrade when you need advanced analytics, more
              websites, and upcoming AI insights.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PricingCard
              title="Free"
              price="$0"
              subtitle="Perfect to get started"
              features={[
                "Single website Tracking",
                "Core metrics (visitors, views, sessions)",
                "Realtime live users",
                "Clean dashboard + charts",
              ]}
              cta="Get Started Free"
              href="/dashboard"
            />

            {/* <PricingCard
              title="Pro-Monthly"
              price="$4.99*"
              subtitle="For founders & growing products"
              features={[
                "Unlimited websites",
                "Advanced analytics + longer history",
                "Geo + device + browser intelligence",
                "Priority performance & reliability",
                "Early access to new features",
              ]}
              highlight="Most Popular"
              cta="Upgrade to Pro"
              href="/dashboard/pricing"
            /> */}

            <PricingCard
              title="Pro+ AI"
              price="$4.99*"
              subtitle="Advanced + AI insights(soon)"
              features={[
                "Track Multiple websites",
                "AI summaries (Coming soon)",
                "Ask questions in English",
                "Smart insight suggestions",
                "Early access & priority support",
                "1M Session Tracking ",
              ]}
              highlight="AI Ready"
              cta="See Pro+ AI"
              href="/dashboard/pricing"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-sm text-white/55">
        © {new Date().getFullYear()} Sitelens — Analytics that make sense.
      </footer>
    </div>
  );
}
