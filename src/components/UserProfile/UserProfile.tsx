import Image from "next/image";
import * as React from "react";

interface UserProfileProps {
  displayName: string;
  avatarUrl: string;
}

function UserProfile({ displayName, avatarUrl }: UserProfileProps) {
  return (
    <div className="flex flex-row items-center gap-4">
      <p className="font-bold">{displayName}</p>
      <a href="#">
        <Image
          src={avatarUrl}
          alt="Profile image"
          width={50}
          height={50}
          className="rounded-full border-black border-2"
        />
      </a>
    </div>
  );
}

export default UserProfile;
