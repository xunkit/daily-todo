"use client";

import Header from "@/components/Header";
import { UserSessionContext } from "@/components/UserSessionProvider";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Home = () => {
  const session = React.useContext(UserSessionContext);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center gap-4 lg:my-[96px]">
        <h2 className="text-sky-950 mt-12 mb-4 text-4xl max-w-[80%] md:text-6xl sm:max-w-[60%] font-medium text-center tracking-tight text-balance">
          A minimal to-do list for the
          <span className="text-sky-500"> minimalists.</span>
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
        <div className="bg-gray-50 py-8 w-[100%] lg:py-12 lg:my-[72px]">
          <div className="flex flex-col items-center max-w-[1200px] gap-8 bg-gray-50 mx-auto">
            <h2 className="text-3xl text-sky-950">
              Getting stuff done in <span className="font-bold">3 steps</span>
            </h2>
            <div className="flex gap-12 md:gap-8 justify-center items-center flex-wrap p-8">
              <div className="flex flex-col items-center gap-4 flex-1 min-w-[300px]">
                <Image
                  src="/step1.png"
                  width={300}
                  height={300}
                  alt="Step 1"
                  className="border-black/10 border-[2px] rounded-lg"
                />
                <p className="text-xl">1. Write down your task</p>
                <p className="text-gray-500 text-center w-[70%] md:w-auto">
                  Keep it SMART: Specific, Measureable, Actionable, Relevant,
                  Time-bound
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 flex-1 min-w-[300px]">
                <Image
                  src="/step2.png"
                  width={300}
                  height={300}
                  alt="Step 2"
                  className="border-black/10 border-[2px] rounded-lg"
                />
                <p className="text-xl">2. When should you finish?</p>
                <p className="text-gray-500 text-center w-[70%] md:w-auto">
                  People who set deadlines are 40% more likely to finish the
                  task
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 flex-1 min-w-[300px]">
                <Image
                  src="/step3.png"
                  width={300}
                  height={300}
                  alt="Step 3"
                  className="border-black/10 border-[2px] rounded-lg"
                />
                <p className="text-xl">3. Let&apos;s do it :D</p>
                <p className="text-gray-500 text-center w-[70%] md:w-auto">
                  Slowly cross off your tasks and stop worrying about the
                  backlog!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p>Built with 💖 </p>

          <Link
            href="https://github.com/xunkit/daily-todo"
            className="text-gray-500 hover:text-gray-950 underline"
          >
            View source code
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
