/** @format */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "../lib/utils";
import SideNavbar from "@/components/SideNavbar";
import { ClerkProvider, UserButton } from "@clerk/nextjs";

import { esES } from "@clerk/localizations";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Huevos Días - Admin Panel",
  description: "Admin panel de Huevos Días",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body
          className={cn(
            "min-h-screen w-full bg-white text-black flex ",
            inter.className,
            {
              "debug-screens": process.env.NODE_ENV === "development",
            }
          )}
        >
          {/* sidebar */}
          <Toaster />
          {/* <p className="border">Sidebar</p> */}
          <div className="fixed top-4 right-4">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
          <SideNavbar />
          {/* main page */}
          <div className="p-8 w-full">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
