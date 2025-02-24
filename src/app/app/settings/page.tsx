"use client";

import { UserSessionContext } from "@/components/UserSessionProvider";
import updateProfileById from "@/lib/prisma/updateDisplayNameByUserId";
import { Session } from "next-auth";
import React from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const Settings = () => {
  // userSession: the user info retrieved from the global context "UserSessionContext"
  const userSession: Session | null = React.useContext(UserSessionContext);
  const [tentativeName, setTentativeName] = React.useState<string>("");

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [successMsg, setSuccessMsg] = React.useState<string>("");

  React.useEffect(() => {
    if (userSession?.user?.name) {
      setTentativeName(userSession.user.name);
    }
  }, [userSession]);

  const router = useRouter();

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
      <Header />
      <div className="flex flex-col items-center py-8">
        <h2 className="text-3xl font-bold mb-8">Settings</h2>
        <form
          className="flex flex-col min-w-[300px]"
          onSubmit={handleUpdateProfile}
        >
          <label className="mb-2 font-bold">Display Name</label>
          <input
            className="rounded-lg border-2 border-black px-4 py-2"
            value={tentativeName}
            onChange={(e) => setTentativeName(e.target.value)}
            disabled={isSaving}
            required
          />
          <div className="flex justify-end gap-4">
            <button
              className={`my-4 w-fit px-8 py-2  rounded-lg ${
                isSaving
                  ? "bg-gray-400 hover:bg-gray-400"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              disabled={isSaving}
              type="button"
              onClick={() => {
                router.back();
              }}
            >
              Go back
            </button>
            <button
              className={`my-4 w-fit px-8 py-2  rounded-lg ${
                isSaving
                  ? "bg-gray-400 hover:bg-gray-400"
                  : "bg-sky-300 text-sky-950 hover:bg-sky-400"
              }`}
              type="submit"
              disabled={isSaving}
            >
              Save
            </button>
          </div>
          {error !== "" && <p className="text-red-400">{error}</p>}
          {successMsg !== "" && <p className="text-green-400">{successMsg}</p>}
        </form>
      </div>
    </>
  );
};

export default Settings;
