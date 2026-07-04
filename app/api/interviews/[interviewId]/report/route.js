import { buildInterviewReport } from "@/utils/server/ai";
import { requireUser } from "@/utils/server/auth";
import { fail, ok } from "@/utils/server/http";
import { listAnswers, markInterviewComplete } from "@/utils/server/interviews";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const result = await listAnswers(identity, interviewId);

    if (!result) {
      return fail("Interview not found", 404);
    }

    const report = buildInterviewReport(result);
    await markInterviewComplete(identity, interviewId, report);

    return ok({
      interview: result.interview,
      answers: result.answers,
      report,
    });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
