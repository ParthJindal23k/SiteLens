import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const AppFont = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-app",
});
export const metadata: Metadata = {
  title: "Sitelens — Analytics that make sense",
  description:
    "Privacy-first, cookieless web analytics. Track visitors, live users, and geo + device insights with a one-line install.",
};

// Sitelens tracking itself. Opt in by pointing NEXT_PUBLIC_ANALYTICS_WEBSITE_ID
// at a website created in the dashboard; otherwise no script is injected.
const selfTrackingWebsiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;
const hostUrl = process.env.NEXT_PUBLIC_HOST_URL;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {selfTrackingWebsiteId && hostUrl && (
            <script
              defer
              data-website-id={selfTrackingWebsiteId}
              data-domain={hostUrl}
              src={`${hostUrl}/analytics.js`}
            />
          )}
        </head>
        <body className={AppFont.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Provider>{children}</Provider>
            
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
