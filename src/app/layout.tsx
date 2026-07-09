import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { BottomNav } from "@/components/layout/bottom-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmazonRoam - Explore While You Deploy",
  description:
    "Your personal travel companion for discovering activities during work trips. Built for Amazonians, by Amazonians.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-amazon-light text-gray-900 antialiased">
        <Providers>
          <main className="min-h-screen pb-20">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
