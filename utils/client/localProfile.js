export const LOCAL_PROFILE_KEY = "ai-mock-interview-local-profile";

function getProfileKey(userId) {
  return userId ? `${LOCAL_PROFILE_KEY}:${userId}` : LOCAL_PROFILE_KEY;
}

export function readLocalProfile(userId) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getProfileKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeLocalProfile(profile, userId) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getProfileKey(userId), JSON.stringify(profile));
}
