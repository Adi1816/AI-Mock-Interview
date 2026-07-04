import { buildInterviewReport, generatePracticePlan } from "@/utils/server/ai";
import { requireUser } from "@/utils/server/auth";
import { fail, ok } from "@/utils/server/http";
import { listAnswers, savePracticePlan } from "@/utils/server/interviews";

export const runtime = "nodejs";

export async function POST(_request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const result = await listAnswers(identity, interviewId);

    if (!result) {
      return fail("Interview not found", 404);
    }

    if (result.answers.length === 0) {
      return fail("Practice plan requires at least one answered question", 400);
    }

    const report = buildInterviewReport(result);
    const aiResult = await generatePracticePlan({
      interview: result.interview,
      answers: result.answers,
      report,
    });
    const plan = await savePracticePlan({
      identity,
      mockId: interviewId,
      plan: aiResult.data,
    });

    return ok({ plan, generated: aiResult.data }, 201);
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
