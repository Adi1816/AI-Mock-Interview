import { evaluateAnswer } from "@/utils/server/ai";
import { requireUser } from "@/utils/server/auth";
import { fail, ok, readJson, validateBody } from "@/utils/server/http";
import { getInterview, listAnswers, saveEvaluatedAnswer } from "@/utils/server/interviews";
import { answerRequestSchema } from "@/utils/server/validators";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const result = await listAnswers(identity, interviewId);

    if (!result) {
      return fail("Interview not found", 404);
    }

    return ok(result);
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}

export async function POST(request, { params }) {
  try {
    const identity = await requireUser();
    const { interviewId } = await params;
    const interview = await getInterview(identity, interviewId);

    if (!interview) {
      return fail("Interview not found", 404);
    }

    const body = await readJson(request);
    const validation = validateBody(answerRequestSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const aiResult = await evaluateAnswer({
      interview,
      question: validation.data.question,
      correctAns: validation.data.correctAns,
      userAnswer: validation.data.userAnswer,
    });
    const answer = await saveEvaluatedAnswer({
      identity,
      interview,
      answerInput: validation.data,
      aiResult,
    });

    return ok({ answer, feedback: aiResult.data }, 201);
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
