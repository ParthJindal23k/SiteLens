"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WebsiteType } from "@/configs/type";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  RefreshCcw,
  SettingsIcon,
  Globe,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import Link from "next/link";

type Props = {
  websiteList: WebsiteType[];
  setFormData: any;
  setReloadData: any;
};

function FormInput({ websiteList, setFormData, setReloadData }: Props) {
  const { websiteId } = useParams();
  const router = useRouter();

  const today = useMemo(() => new Date(), []);
  const [analyticType, setAnalyticType] = useState("hourly");

  const [date, setDate] = useState<DateRange | undefined>({
    from: today,
  });

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from) return;

    if (range.from && !range.to) {
      setDate({ from: range.from });
      return;
    }

    setDate({ from: range.from, to: range.to });
  };

  const handleToday = () => setDate({ from: today });
  const handleReset = () => setDate({ from: today });

  useEffect(() => {
    setFormData({
      analyticType,
      fromDate: date?.from ?? today,
      toDate: date?.to ?? today,
    });
  }, [date, analyticType, setFormData, today]);

  const dateLabel = useMemo(() => {
    if (!date?.from) return "Select date";
    if (!date.to) return format(date.from, "PPP");
    return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
  }, [date]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            value={(websiteId as string) || ""}
            onValueChange={(v) => router.push(`/dashboard/website/${v}`)}
          >
            <SelectTrigger
              className="
                h-11 w-full sm:w-[260px]
                rounded-xl border bg-background shadow-sm
                focus:ring-2 focus:ring-primary/20
              "
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select a website" />
              </div>
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectGroup>
                <SelectLabel>Website</SelectLabel>
                {websiteList.map((website, index) => (
                  <SelectItem key={index} value={website.websiteId}>
                    {website.domain.replace("https://", "")}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="
                  h-11 w-full sm:w-[320px] lg:w-[360px]
                  justify-start rounded-xl border bg-background shadow-sm
                  font-normal text-left
                  focus:ring-2 focus:ring-primary/20
                "
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />

                <span className="truncate">{dateLabel}</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto rounded-2xl p-0 shadow-lg">
              {/* quick actions */}
              <div className="flex items-center justify-between gap-2 border-b p-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg"
                  onClick={handleToday}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>

              <Calendar
                mode="range"
                selected={date}
                onSelect={handleDateChange}
                className="w-[320px] max-w-full p-3"
              />
            </PopoverContent>
          </Popover>

          <Select value={analyticType} onValueChange={setAnalyticType}>
            <SelectTrigger
              className="
                h-11 w-full sm:w-[160px]
                rounded-xl border bg-background shadow-sm
                focus:ring-2 focus:ring-primary/20
              "
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setReloadData(true)}
            className="
              h-11 w-full sm:w-auto
              rounded-xl border bg-background shadow-sm 
              focus:ring-2 focus:ring-primary/20
            "
          >
            <RefreshCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/website/${websiteId}/settings`}>
            <Button
              variant="outline"
              className="
                h-11 w-full lg:w-auto
                rounded-xl border bg-background shadow-sm
                focus:ring-2 focus:ring-primary/20
              "
            >
              <SettingsIcon className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Settings</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FormInput;
