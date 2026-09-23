import type { Metadata } from "next";

import { AuthRouteGuard } from "@/features/auth/components/AuthRouteGuard/AuthRouteGuard";

import "./globals.css";

export const metadata: Metadata = {
  title: "ProfileShare",
  description: "Professional profile and resume sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthRouteGuard>{children}</AuthRouteGuard>
      </body>
    </html>
  );
}
