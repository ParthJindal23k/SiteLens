"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { WebsiteType } from "@/configs/type";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  Loader,
  Settings2,
  ShieldAlert,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { usePublicOrigin } from "@/hooks/use-public-origin";

function WebsiteSettings() {
  const { websiteId } = useParams();
  const router = useRouter();
  const origin = usePublicOrigin();

  const [websiteDetails, setWebsiteDetails] = useState<WebsiteType | null>(null);
  const [loadingWebsite, setLoadingWebsite] = useState(false);

  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const script = useMemo(() => {
    return `<script
  defer
  data-website-id="${websiteId}"
  data-domain="${websiteDetails?.domain ?? ""}"
  src="${origin}/analytics.js">
</script>`;
  }, [websiteId, websiteDetails?.domain, origin]);

  const GetWebsiteDetails = async () => {
    try {
      setLoadingWebsite(true);
      const result = await axios.get(
        "/api/website?websiteId=" + websiteId + "&websiteOnly=true"
      );
      setWebsiteDetails(result.data);
    } catch (e) {
      toast.error("Failed to fetch website details");
    } finally {
      setLoadingWebsite(false);
    }
  };

  useEffect(() => {
    GetWebsiteDetails();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  };

  const onDeleteWebsite = async () => {
    try {
      setDeleting(true);
      await axios.delete("/api/website", {
        data: { websiteId },
      });

      toast.success("Website deleted successfully");
      router.replace("/dashboard");
    } catch (e) {
      toast.error("Failed to delete website");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] px-3 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* ✅ Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-fit rounded-xl px-2 text-muted-foreground hover:text-foreground"
          >
            <Link href={`/dashboard/website/${websiteId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Back to Analytics</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Website Settings</span>
          </div>
        </div>

        {/* ✅ Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Website Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage tracking setup, website details, and sensitive actions.
          </p>
        </div>

        <Separator />

        {/* ✅ Website Info Card */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Website
                </CardTitle>
                <CardDescription>
                  Configuration for your tracked website
                </CardDescription>
              </div>

              <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                {websiteId}
              </span>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingWebsite ? (
              <>
                <div className="space-y-2 rounded-xl border bg-background/60 p-4">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-6 w-[90%] rounded-md" />
                </div>
                <div className="space-y-2 rounded-xl border bg-background/60 p-4">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-6 w-[90%] rounded-md" />
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border bg-background/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Domain
                  </p>
                  <p className="mt-1 font-semibold break-all">
                    {websiteDetails?.domain?.replace("https://", "") || "—"}
                  </p>
                </div>

                <div className="rounded-xl border bg-background/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Website ID
                  </p>
                  <p className="mt-1 font-semibold break-all">
                    {websiteDetails?.websiteId || "—"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ✅ Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full sm:w-fit rounded-2xl border bg-background p-1 shadow-sm">
            <TabsTrigger
              value="general"
              className="rounded-xl flex-1 sm:flex-none"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="rounded-xl flex-1 sm:flex-none"
            >
              Danger
            </TabsTrigger>
          </TabsList>

          {/* ✅ General */}
          <TabsContent value="general" className="mt-4">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Install Tracking Script</CardTitle>
                <CardDescription>
                  Copy and paste this script inside the{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    &lt;head&gt;
                  </code>{" "}
                  of your website.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* ✅ Premium code editor block */}
                <div className="relative overflow-hidden rounded-2xl border bg-slate-950 text-slate-100 shadow-sm">
                  {/* subtle top glow */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent" />

                  {/* header bar */}
                  <div className="relative flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {/* editor dots */}
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      </div>

                      <span className="ml-2 text-xs font-medium text-slate-300">
                        Install Script
                      </span>

                      <span className="hidden sm:inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                        analytics.js
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleCopy}
                      className="
                        rounded-xl bg-white/10 text-slate-100
                        hover:bg-white/15
                        border border-white/10
                      "
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="ml-2">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="ml-2">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* code body */}
                  <div className="relative">
                    {/* faint grid */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:28px_28px]" />

                    <pre
  className="
    relative max-h-[340px] overflow-auto
    px-4 py-4 text-[13px] leading-relaxed
    font-mono
  "
  style={{ scrollbarWidth: "thin" }}
>
  {/* left accent */}
  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent" />

  {/* ✅ green code vibe */}
  <code className="whitespace-pre-wrap break-words bg-gradient-to-b from-emerald-200 to-emerald-400 bg-clip-text text-transparent">
    {script}
  </code>
</pre>
 
                  </div>
                </div>

                {/* ✅ note */}
                <div className="rounded-2xl border bg-background/60 p-4">
                  <p className="text-sm font-medium">Verification tip</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    After adding the script, visit your website and check{" "}
                    <span className="font-medium text-foreground">
                      Live Users
                    </span>{" "}
                    in analytics to confirm installation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Danger */}
          <TabsContent value="danger" className="mt-4">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  These actions are irreversible. Please proceed carefully.
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Delete this website from Sitelens
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Permanently removes analytics, visitors history, and
                      associated data.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="rounded-xl text-white w-full sm:w-auto"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="ml-2">Delete</span>
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. It will permanently
                          delete this website and all analytics data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          className="rounded-xl text-white"
                          variant="destructive"
                          disabled={deleting}
                          onClick={onDeleteWebsite}
                        >
                          {deleting ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            "Continue"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default WebsiteSettings;
