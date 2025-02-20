"use client";
import { Session } from "next-auth";
import * as React from "react";

export const UserSessionContext = React.createContext<Session | null>(null);

interface UserSessionProviderProps {
  session: Session | null;
  children: React.ReactNode;
}

function UserSessionProvider({ session, children }: UserSessionProviderProps) {
  return (
    <UserSessionContext.Provider value={session}>
      {children}
    </UserSessionContext.Provider>
  );
}

export default UserSessionProvider;
