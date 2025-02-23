"use client";

import UserProfile from "@/components/UserProfile";
import { UserSessionContext } from "@/components/UserSessionProvider";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Home = () => {
  const session = React.useContext(UserSessionContext);

  return (
    <>
      <div className="bg-sky-50 flex justify-between items-center px-8 py-8">
        <h1 className="text-sky-950 font-bold">DailyTodo</h1>
        {session?.user?.name && session?.user?.image && (
          <UserProfile
            displayName={session.user.name}
            avatarUrl={session.user.image}
          />
        )}
      </div>
      <h2 className="mt-12 mb-4 text-xl font-bold text-center">
        DailyTodo keeps you moving everyday.
      </h2>
      {!session?.user ? (
        <div className="flex flex-col gap-4 items-center justify-center">
          <button
            className="px-4 py-2 bg-sky-300 text-sky-950 hover:bg-sky-400 rounded-full"
            onClick={() => {
              signIn("google");
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center justify-center">
          <Link
            className="px-4 py-2 bg-sky-300 text-sky-950 hover:bg-sky-400 rounded-full"
            href="/app"
          >
            Go to App
          </Link>
        </div>
      )}
    </>
  );
};

export default Home;
