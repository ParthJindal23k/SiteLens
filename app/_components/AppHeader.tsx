"use client";

import React from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import ToggleTheme from "./ToggleTheme";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function AppHeader() {
  const { user } = useUser();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-neutral-200/70 dark:border-neutral-800/70",
        "bg-white/75 dark:bg-neutral-950/70",
        "backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 supports-[backdrop-filter]:dark:bg-neutral-950/60"
      )}
    >
<div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-3 sm:px-8">
        <Link href={user ? "/dashboard" : "/"} className="group flex items-center gap-2.5">
          <div className="relative">
            <Image
              src="/logo2.png"
              alt="Sitelens logo"
              width={36}
              height={36}
              className="rounded-lg shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800 transition group-hover:shadow-md"
              priority
            />
            <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-amber-300/0 via-transparent to-purple-400/0 group-hover:from-amber-300/10 group-hover:to-purple-400/10 transition" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Sitelens
            </span>
            <span className="pt-1 hidden sm:block text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Analytics made simple
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <div className="hidden sm:block">
                <ToggleTheme />
              </div>

              <SignInButton mode="modal" signUpForceRedirectUrl="/dashboard">
                <Button
                  className={cn(
                    "rounded-full",
                    "shadow-sm",
                    "bg-neutral-900 text-white hover:bg-neutral-800",
                    "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  )}
                >
                  Get Started
                </Button>
              </SignInButton>
            </>
          ) : (
            <>
              <ToggleTheme />

              <Link href="/dashboard/pricing" className="hidden sm:block">
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    "border-amber-300/70 dark:border-amber-500/30",
                    "text-amber-800 dark:text-amber-300",
                    "bg-amber-50/60 dark:bg-amber-500/10",
                    "hover:bg-amber-100/70 dark:hover:bg-amber-500/20",
                    "hover:text-amber-900 dark:hover:text-amber-200",
                    "transition-all duration-200"
                  )}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Subscription
                </Button>
              </Link>

              <Link href="/dashboard/pricing" className="sm:hidden">
                <Button
                  size="icon"
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    "border-amber-300/70 dark:border-amber-500/30",
                    "bg-amber-50/60 dark:bg-amber-500/10",
                    "text-amber-800 dark:text-amber-300"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 rounded-full ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm",
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
