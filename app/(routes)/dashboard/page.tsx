"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WebsiteCard from "./_components/WebsiteCard";
import { WebsiteInfoType } from "@/configs/type";
import { Plus, Globe } from "lucide-react";
import { toast } from "sonner";

function Dashboard() {
  const [websiteList, setWebsiteList] = useState<WebsiteInfoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetUserWebsites();
  }, []);

  const GetUserWebsites = async () => {
    try {
      setLoading(true);
      const result = await axios.get("/api/website");
      setWebsiteList(Array.isArray(result.data) ? result.data : []);
    } catch (e) {
      toast.error("Could not load your websites. Please refresh to try again.");
      setWebsiteList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pb-10">
      {/* ✅ Container */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 space-y-6">
        {/* ✅ Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              My Websites
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your tracked websites and view analytics at a glance.
            </p>
          </div>

          <Link href="/dashboard/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-xl">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Website</span>
            </Button>
          </Link>
        </div>

        {/* ✅ Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="
                  rounded-2xl border bg-card shadow-sm
                  p-5 space-y-4
                "
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[55%] rounded-md" />
                    <Skeleton className="h-3 w-[35%] rounded-md" />
                  </div>
                </div>

                <Skeleton className="h-[92px] w-full rounded-xl" />

                <div className="flex justify-between gap-2">
                  <Skeleton className="h-8 w-[32%] rounded-xl" />
                  <Skeleton className="h-8 w-[32%] rounded-xl" />
                  <Skeleton className="h-8 w-[32%] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Empty State */}
        {!loading && websiteList.length === 0 && (
          <div
            className="
              mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm
            "
          >
            <div className="relative p-8 sm:p-12 text-center">
              {/* subtle background glow */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-400/10" />

              <div className="relative mx-auto flex max-w-lg flex-col items-center gap-4">
                <div className="grid place-items-center rounded-2xl border bg-background p-4 shadow-sm">
                  <Image
                    src={"/website.png"}
                    alt="Add website"
                    height={90}
                    width={90}
                    className="opacity-95"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    No websites added yet
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add your first website to start tracking visitors, sessions
                    and performance insights.
                  </p>
                </div>

                <Link href="/dashboard/new" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto rounded-xl mt-2">
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Add Website</span>
                  </Button>
                </Link>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  Setup takes less than 2 minutes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Website Grid */}
        {!loading && websiteList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {websiteList.map((website, index) => (
              <WebsiteCard key={index} websiteInfo={website} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
