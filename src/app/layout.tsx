import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import React from "react";
import UserSessionProvider from "@/components/UserSessionProvider";
import { auth } from "@/auth";
import { Session } from "next-auth";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailyTodo",
  description: "Manage your daily to-dos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: Session | null = await auth();
  return (
    <html lang="en">
      <body className={`${lato.className} antialiased`}>
        <div className="root">
          <UserSessionProvider session={session}>
            {children}
          </UserSessionProvider>
        </div>
      </body>
    </html>
  );
}
