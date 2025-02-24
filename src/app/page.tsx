"use client";

import Header from "@/components/Header";
import { UserSessionContext } from "@/components/UserSessionProvider";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Home = () => {
  const session = React.useContext(UserSessionContext);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-sky-950 mt-12 mb-4 text-4xl max-w-[80%] md:text-6xl sm:max-w-[60%] font-medium text-center tracking-tight text-balance">
          A simple to-do list for{" "}
          <span className="text-sky-500">minimalistic </span>
          people.
        </h2>
        <p className="max-w-[80%] sm:max-w-[38%] text-center text-pretty text-gray-500 text-xl">
          Making tasks shouldn’t be harder than executing them. Don’t waste any
          more time crafting to-do’s.
        </p>
        <React.Suspense fallback={<></>}>
          {!session?.user ? (
            <div className="flex flex-col gap-4 items-center justify-center">
              <button
                className="my-6 px-8 py-4 bg-sky-500 text-white hover:bg-sky-600 rounded-lg"
                onClick={() => {
                  signIn("google");
                }}
              >
                Sign up with Google
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center">
              <Link
                className="my-6 px-8 py-4 bg-white hover:bg-gray-100 rounded-lg border-black/10 border-[2px]"
                href="/app"
              >
                Continue to App
              </Link>
            </div>
          )}
        </React.Suspense>
      </div>
    </>
  );
};

export default Home;
