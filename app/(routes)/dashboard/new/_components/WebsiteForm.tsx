"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Globe, Loader2Icon, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useRouter } from "next/navigation";
import CleanToast from "./CleanToast";
import { TIMEZONE_GROUPS } from "@/lib/timezone";
import { toast } from "sonner";

function WebsiteForm() {
  const [domain, setDomain] = useState("");
  const [timezone, setTimezone] = useState("");
  const [enableLocalHostTracking, setEnableLocalHostTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });
  const router = useRouter();

  const goToScriptStep = (newWebsiteId: string, newDomain: string) => {
    router.push(
      `/dashboard/new?step=script&websiteId=${encodeURIComponent(
        newWebsiteId
      )}&domain=${encodeURIComponent(newDomain)}`
    );
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const websiteId = crypto.randomUUID();

    try {
      const result = await axios.post("/api/website", {
        websiteId,
        domain,
        timezone,
        enableLocalHostTracking,
      });

      goToScriptStep(result.data.data.websiteId, result.data.data.domain);
    } catch (e: any) {
      const data = e?.response?.data;

      // The API answers 402 with error: "upgrade_required". The old check read
      // result.data.msg, a field the API never returned, so this toast was dead.
      if (data?.error === "upgrade_required") {
        setToastMessage({
          title: "Upgrade to Pro",
          description: "Your current plan allows only one website.",
        });
        setToastOpen(true);
        return;
      }

      // Already tracking this domain: jump straight to its install script.
      if (data?.error === "domain_exists" && data.data) {
        goToScriptStep(data.data.websiteId, data.data.domain);
        return;
      }

      toast.error(data?.message ?? "Could not add website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Website</CardTitle>
        </CardHeader>

        <Separator />

        <CardContent>
          <form className="mt-5" onSubmit={onFormSubmit}>
            <label className="text-sm" htmlFor="domain">
              Domain{" "}
            </label>
            <InputGroup>
              <InputGroupInput
                type="text"
                id="domain"
                placeholder="mywebsite.com"
                required
                onChange={(e) => setDomain(e.target.value)}
              />
              <InputGroupAddon>
                <Globe />
                <span>https://</span>
              </InputGroupAddon>
            </InputGroup>

            <div className="mt-5">
              <label className="text-sm " htmlFor="timezone">
                Timezone{" "}
              </label>

              <Select required onValueChange={(value) => setTimezone(value)}>
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_GROUPS.map((group) => (
                    <SelectGroup key={group.label}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.zones.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Checkbox
                onCheckedChange={(value: boolean) =>
                  setEnableLocalHostTracking(value)
                }
              />
              <span>Enable localhost tracking in development</span>
            </div>

            <div className="mt-4 w-full">
              <Button className="w-full" disabled={loading} type="submit">
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Plus />
                )}
                Add Website
              </Button>

              {toastOpen && (
                <CleanToast
                  title={toastMessage.title}
                  description={toastMessage.description}
                  onClose={() => setToastOpen(false)}
                />
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default WebsiteForm;
