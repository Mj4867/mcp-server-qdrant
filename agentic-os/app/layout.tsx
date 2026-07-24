import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StatusProvider } from "@/components/StatusProvider";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Agentic OS — Mission Control",
  description: "Local-first mission control for Claude and your AI agent fleet.",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <StatusProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          </div>
          <MobileNav />
        </StatusProvider>
      </body>
    </html>
  );
}
