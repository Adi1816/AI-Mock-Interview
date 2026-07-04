import { requireUser } from "@/utils/server/auth";
import { fail, ok, readJson, validateBody } from "@/utils/server/http";
import { getProfile, upsertProfile } from "@/utils/server/interviews";
import { profileSchema } from "@/utils/server/validators";
import { isDatabaseConfigured } from "@/utils/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const identity = await requireUser();

    if (!isDatabaseConfigured()) {
      return ok({
        profile: null,
        databaseConfigured: false,
      });
    }

    const profile = await getProfile(identity);
    return ok({ profile, databaseConfigured: true });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}

export async function PUT(request) {
  try {
    const identity = await requireUser();
    const body = await readJson(request);
    const validation = validateBody(profileSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    if (!isDatabaseConfigured()) {
      return ok({
        profile: validation.data,
        databaseConfigured: false,
        storedLocally: true,
      });
    }

    const profile = await upsertProfile(identity, validation.data);
    return ok({ profile, databaseConfigured: true });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
