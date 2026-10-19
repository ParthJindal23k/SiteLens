"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { usePublicOrigin } from "@/hooks/use-public-origin";

export default function InstallScript() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("websiteId");
  const domain = searchParams.get("domain");
  const origin = usePublicOrigin();

  const [copied, setCopied] = useState(false);

  const script = `<script
  defer
  data-website-id="${websiteId}"
  data-domain="${domain}"
  src="${origin}/analytics.js">
</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Install the Sitelens Script</CardTitle>
        <p className="text-sm text-muted-foreground mt-4">
          Copy and paste this into the <code>&lt;head&gt;</code> of your website
        </p>
      </CardHeader>

      <CardContent>
        <pre
          className="
    relative rounded-lg p-4 text-sm leading-relaxed overflow-x-auto
    bg-slate-100 text-green-600
    dark:bg-slate-900 dark:text-green-400
    border border-slate-200 dark:border-slate-700
    transition-colors duration-200
  "
        >
          {script}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="
      absolute top-2 right-2
      text-slate-500
      hover:text-slate-800
      hover:bg-slate-200
      dark:text-slate-400
      dark:hover:text-slate-100
      dark:hover:bg-slate-800
      transition-colors
    "
            aria-label="Copy script"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </pre>

        {/* <Button className="w-full mt-4">
          Ok, I’ve installed the script
        </Button> */}
      </CardContent>
    </Card>
  );
}
