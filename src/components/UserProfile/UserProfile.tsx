import Image from "next/image";
import * as React from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserProfileProps {
  displayName: string;
  avatarUrl: string;
}

function UserProfile({ displayName, avatarUrl }: UserProfileProps) {
  return (
    <div className="flex flex-row items-center gap-4">
      <p className="font-bold">{displayName}</p>
      <Dropdown.Root>
        <Dropdown.Trigger>
          <Image
            src={avatarUrl}
            alt="Profile image"
            width={50}
            height={50}
            className="rounded-full border-black border-2"
          />
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content className="bg-white border-black/5 border-2 min-w-[220px] shadow text-xl p-2">
            <Link
              href="/app/settings"
              className="p-2 hover:bg-gray-100 hover:outline-none w-[100%] block text-start"
            >
              Settings
            </Link>
            <button
              className="p-2 bg-red-50 hover:bg-red-100 hover:outline-none w-[100%] text-start"
              onClick={() => {
                signOut();
              }}
            >
              Sign out
            </button>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </div>
  );
}

export default UserProfile;
