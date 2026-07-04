import { evaluateAnswer } from "@/utils/server/ai";
import { requireUser } from "@/utils/server/auth";
import { fail, ok, readJson, validateBody } from "@/utils/server/http";
import { answerRequestSchema } from "@/utils/server/validators";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await requireUser();
    const body = await readJson(request);
    const validation = validateBody(answerRequestSchema, body?.answer || body);

    if (!validation.success) {
      return validation.response;
    }

    const interview = body?.interview || {};
    const aiResult = await evaluateAnswer({
      interview,
      question: validation.data.question,
      correctAns: validation.data.correctAns,
      userAnswer: validation.data.userAnswer,
    });

    return ok(
      {
        feedback: aiResult.data,
        answer: {
          questionId: validation.data.questionId,
          question: validation.data.question,
          correctAns: aiResult.data.idealAnswer || validation.data.correctAns,
          userAnswer: validation.data.userAnswer,
          feedback: aiResult.data.feedback,
          rating: String(aiResult.data.rating),
          normalizedRating: String(aiResult.data.rating),
          scores: aiResult.data.scores,
          coachingTips: aiResult.data.coachingTips,
          communicationMetrics: aiResult.data.communicationMetrics,
        },
        demo: true,
      },
      201
    );
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
