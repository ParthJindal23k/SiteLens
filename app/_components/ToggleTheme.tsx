"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ToggleTheme() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = useMemo(() => {
    if (!mounted) return false;
    return resolvedTheme === "dark";
  }, [resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-6 w-12 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
        {isDark ? "Dark" : "Light"}
      </span>

      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle theme"
        aria-pressed={isDark}
        className={cn(
          "relative h-6 w-12 rounded-full transition-colors duration-300",
          "ring-1 ring-neutral-200 dark:ring-neutral-800",
          "shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          isDark ? "bg-[#071b26]" : "bg-[#fff3c4]"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            isDark
              ? "bg-gradient-to-r from-sky-500/10 via-transparent to-indigo-400/10"
              : "bg-gradient-to-r from-amber-400/10 via-transparent to-orange-300/10"
          )}
        />

        <span
          className={cn(
            "absolute top-1 left-1 grid h-4 w-4 place-items-center rounded-full",
            "transition-all duration-300 ease-out",
            "shadow-md",
            isDark
              ? "translate-x-6 bg-sky-400 text-white"
              : "translate-x-0 bg-amber-400 text-white"
          )}
        >
          {isDark ? (
            <Moon className="h-3 w-3" />
          ) : (
            <Sun className="h-3 w-3" />
          )}
        </span>
      </button>
    </div>
  );
}
