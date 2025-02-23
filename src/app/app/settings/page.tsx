"use client";

import UserProfile from "@/components/UserProfile";
import { UserSessionContext } from "@/components/UserSessionProvider";
import updateProfileById from "@/lib/prisma/updateDisplayNameByUserId";
import { Session } from "next-auth";
import React from "react";
import Link from "next/link";

const Settings = () => {
  // userSession: the user info retrieved from the global context "UserSessionContext"
  const userSession: Session | null = React.useContext(UserSessionContext);

  const [displayName, setDisplayName] = React.useState<string>("");
  const [tentativeName, setTentativeName] = React.useState<string>("");

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [successMsg, setSuccessMsg] = React.useState<string>("");

  React.useEffect(() => {
    if (userSession?.user?.name) {
      setDisplayName(userSession.user.name);
      setTentativeName(userSession.user.name);
    }
  }, [userSession]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMsg("");
    if (!userSession?.user?.id) throw new Error("User ID not found");
    try {
      const newName = await updateProfileById(
        userSession?.user?.id,
        tentativeName
      );
      if (newName) {
        setDisplayName(newName);
      } else {
        throw new Error("An error occurred while changing the display name");
      }
      setSuccessMsg("Successfully updated the user profile!");
    } catch (error) {
      console.error(error);
      setError((error as Error).toString());
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-sky-50 flex justify-between items-center px-8 py-8">
        <Link href="/">
          <h1 className="text-sky-950 font-bold">DailyTodo</h1>
        </Link>
        {userSession?.user?.name && userSession?.user?.image && (
          <UserProfile
            displayName={displayName}
            avatarUrl={userSession.user.image}
          />
        )}
      </div>
      <div className="flex flex-col items-center py-8">
        <h2 className="text-3xl font-bold mb-8">Settings</h2>
        <form
          className="flex flex-col min-w-[300px]"
          onSubmit={handleUpdateProfile}
        >
          <label className="mb-2 font-bold">Display Name</label>
          <input
            className="rounded-full border-2 border-black px-4 py-2"
            value={tentativeName}
            onChange={(e) => setTentativeName(e.target.value)}
            disabled={isSaving}
            required
          />
          <button
            className={`my-4 self-end w-fit px-8 py-2  rounded-full ${
              isSaving
                ? "bg-gray-400 hover:bg-gray-400"
                : "bg-sky-300 text-sky-950 hover:bg-sky-400"
            }`}
            type="submit"
            disabled={isSaving}
          >
            Save
          </button>
          {error !== "" && <p className="text-red-400">{error}</p>}
          {successMsg !== "" && <p className="text-green-400">{successMsg}</p>}
        </form>
      </div>
    </>
  );
};

export default Settings;
