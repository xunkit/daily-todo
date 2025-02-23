import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthCheck({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return <>{children}</>;
}
