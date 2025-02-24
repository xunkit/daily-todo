import Link from "next/link";
import * as React from "react";
import UserProfile from "../UserProfile";
import { UserSessionContext } from "../UserSessionProvider";

function Header() {
  const session = React.useContext(UserSessionContext);

  return (
    <div className="flex justify-between items-center px-8 py-4 border-black/10 border-b-[2px]">
      <h1 className="text-sky-950 font-medium hover:text-sky-800">
        <Link href="/">DailyTodo</Link>
      </h1>
      <React.Suspense fallback={<></>}>
        {session?.user?.name && session?.user?.image && (
          <UserProfile
            displayName={session.user.name}
            avatarUrl={session.user.image}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default Header;
