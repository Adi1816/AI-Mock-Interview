"use client";

import { UserButton } from "@clerk/nextjs";

export default function ClientUserButton() {
  return (
    <UserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-12 h-12',
        }
      }}
    />
  );
}