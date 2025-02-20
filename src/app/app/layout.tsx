import { auth, signIn } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
        className="w-[100svw] h-[100svh] flex flex-col gap-4 items-center justify-center text-2xl"
      >
        <h1>Please sign in to continue.</h1>
        <button
          className="px-4 py-2 bg-sky-300 text-sky-950 hover:bg-sky-400 rounded-full"
          type="submit"
        >
          Sign in with Google
        </button>
      </form>
    );
  }

  return <>{children}</>;
}
