import { requireUser } from "@/utils/server/auth";
import { fail, ok } from "@/utils/server/http";
import { deleteInterview, getInterview } from "@/utils/server/interviews";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const interview = await getInterview(identity, interviewId);

    if (!interview) {
      return fail("Interview not found", 404);
    }

    return ok({ interview });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const deleted = await deleteInterview(identity, interviewId);

    if (!deleted) {
      return fail("Interview not found", 404);
    }

    return ok({ success: true });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
