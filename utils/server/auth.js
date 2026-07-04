import { auth, currentUser } from "@clerk/nextjs/server";

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.status = 401;
  }
}

export async function requireUser() {
  const authState = await auth();

  if (!authState?.userId) {
    throw new AuthError();
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;

  return {
    userId: authState.userId,
    email,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || email,
  };
}
