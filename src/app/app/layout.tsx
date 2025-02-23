import { Suspense } from "react";
import Loading from "./loading";
import AuthCheck from "@/components/AuthCheck";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "App",
  description: "Manage your daily to-dos",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <AuthCheck>{children}</AuthCheck>
    </Suspense>
  );
}
