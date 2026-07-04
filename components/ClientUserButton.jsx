"use client";

import { UserButton } from "@clerk/nextjs";
import { clerkAppearance } from "@/utils/clerkAppearance";

export default function ClientUserButton() {
  return <UserButton afterSignOutUrl="/" appearance={clerkAppearance} />;
}
