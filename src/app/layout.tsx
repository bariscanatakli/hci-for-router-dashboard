// TODO: Add sidebar + topbar layout using Tailwind and Shadcn UI

import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/auth/AuthShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Router Dashboard",
  description: "HCI-first, task-oriented router management dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("bg-slate-950 text-slate-100 antialiased")}>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
