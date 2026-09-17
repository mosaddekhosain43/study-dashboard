import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Bengali, Sora } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getSubjects } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

const sora = Sora({
  subsets: ["latin"],
  variable: "--ff-sora",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--ff-inter",
  display: "swap",
});
const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--ff-bengali",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0d1b14",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Study Dashboard",
  description:
    "Personal study tracker: natural-language study updates, syllabus progress, deadlines and revision planning.",
  manifest: "/manifest.json",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [subjects, user] = await Promise.all([
    getSubjects().catch(() => []),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${bengali.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <AppShell subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} user={user}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
