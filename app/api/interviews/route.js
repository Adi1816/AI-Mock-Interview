import { requireUser } from "@/utils/server/auth";
import { fail, ok, readJson, validateBody } from "@/utils/server/http";
import { createDemoInterviewRecord, createInterviewRecord, listInterviews } from "@/utils/server/interviews";
import { generateInterviewPlan } from "@/utils/server/ai";
import { interviewRequestSchema } from "@/utils/server/validators";
import { isDatabaseConfigured } from "@/utils/db";

export const runtime = "nodejs";

function withInterviewFocus(input) {
  if (input.jobDescription) {
    return input;
  }

  const modeLabel = String(input.interviewType || "technical").replace(/-/g, " ");

  return {
    ...input,
    jobDescription: `Run a ${input.difficulty || "mid"} ${modeLabel} interview for ${input.jobTitle}. Focus on ${input.techStacks}, practical project discussion, fundamentals, communication quality, and role-ready tradeoffs.`,
  };
}

export async function GET() {
  try {
    const identity = await requireUser();

    if (!isDatabaseConfigured()) {
      return ok({
        interviews: [],
        databaseConfigured: false,
      });
    }

    const interviews = await listInterviews(identity);
    return ok({ interviews, databaseConfigured: true });
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}

export async function POST(request) {
  try {
    const identity = await requireUser();
    const body = await readJson(request);
    const validation = validateBody(interviewRequestSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const input = withInterviewFocus(validation.data);
    const aiResult = await generateInterviewPlan(input);

    if (!isDatabaseConfigured()) {
      const interview = createDemoInterviewRecord({
        identity,
        input,
        aiResult,
      });

      return ok(
        {
          interview,
          demo: true,
          databaseConfigured: false,
        },
        201
      );
    }

    const interview = await createInterviewRecord({
      identity,
      input,
      aiResult,
    });

    return ok({ interview }, 201);
  } catch (error) {
    return fail(error.message, error.status || 500);
  }
}
