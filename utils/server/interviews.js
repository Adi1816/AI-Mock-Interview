import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/utils/db";
import { CandidateProfile, InterviewTrace, MockInterview, PracticePlan, UserAnswer } from "@/utils/schema";

function ownerFilter(identity) {
  const filters = [eq(MockInterview.createdBy, identity.userId)];

  if (identity.email) {
    filters.push(eq(MockInterview.createdBy, identity.email));
    filters.push(eq(MockInterview.createdByEmail, identity.email));
  }

  return or(...filters);
}

function today() {
  return new Intl.DateTimeFormat("en-GB").format(new Date()).replace(/\//g, "-");
}

export function normalizeInterview(row) {
  let questions = [];

  try {
    const parsed = JSON.parse(row.jsonMockResp || "{}");
    questions = parsed.interviewQuestions || parsed.interview_questions || [];
  } catch {
    questions = [];
  }

  return {
    ...row,
    questions,
    questionCount: row.questionCount || questions.length,
  };
}

export async function listInterviews(identity) {
  return db.select().from(MockInterview).where(ownerFilter(identity)).orderBy(desc(MockInterview.id));
}

export async function getInterview(identity, mockId) {
  const result = await db
    .select()
    .from(MockInterview)
    .where(and(eq(MockInterview.mockId, mockId), ownerFilter(identity)))
    .limit(1);

  return result[0] ? normalizeInterview(result[0]) : null;
}

function buildInterviewPayload(input, aiResult) {
  return {
    ...aiResult.data,
    generatedAt: new Date().toISOString(),
    inputSummary: {
      jobTitle: input.jobTitle,
      techStacks: input.techStacks,
      interviewType: input.interviewType,
      difficulty: input.difficulty,
      targetCompany: input.targetCompany || null,
    },
  };
}

function buildInterviewValues({ mockId, traceId, identity, input, aiResult, payload, local = false }) {
  return {
    id: local ? mockId : undefined,
    mockId,
    jsonMockResp: JSON.stringify(payload),
    jobPosition: input.jobTitle,
    jobDescription: input.jobDescription,
    techStacks: input.techStacks,
    jobExperience: String(input.duration),
    interviewType: input.interviewType,
    difficulty: input.difficulty,
    targetCompany: input.targetCompany || null,
    resumeText: input.resumeText || null,
    companyContext: input.companyContext || null,
    questionCount: input.questionCount,
    createdBy: identity.userId,
    createdByEmail: identity.email,
    createdAt: today(),
    status: "ready",
    aiModel: aiResult.model,
    aiTraceId: traceId,
    metadata: payload.metadata || {},
    local,
  };
}

export function createDemoInterviewRecord({ identity, input, aiResult }) {
  const mockId = `local-${crypto.randomUUID()}`;
  const traceId = crypto.randomUUID();
  const payload = buildInterviewPayload(input, aiResult);

  return normalizeInterview(
    buildInterviewValues({
      mockId,
      traceId,
      identity,
      input,
      aiResult,
      payload,
      local: true,
    })
  );
}

export async function createInterviewRecord({ identity, input, aiResult }) {
  const mockId = crypto.randomUUID();
  const traceId = crypto.randomUUID();
  const payload = buildInterviewPayload(input, aiResult);
  const values = buildInterviewValues({
    mockId,
    traceId,
    identity,
    input,
    aiResult,
    payload,
  });
  delete values.id;
  delete values.local;

  const inserted = await db
    .insert(MockInterview)
    .values(values)
    .returning();

  await saveTrace({
    traceId,
    mockId,
    identity,
    eventType: "question_generation",
    aiResult,
    payload: {
      input,
      questionCount: payload.interviewQuestions.length,
    },
  });

  return normalizeInterview(inserted[0]);
}

export async function deleteInterview(identity, mockId) {
  const interview = await getInterview(identity, mockId);

  if (!interview) {
    return false;
  }

  await db.delete(UserAnswer).where(eq(UserAnswer.mockIdRef, mockId));
  await db.delete(PracticePlan).where(eq(PracticePlan.mockIdRef, mockId));
  await db.delete(InterviewTrace).where(eq(InterviewTrace.mockIdRef, mockId));
  await db.delete(MockInterview).where(eq(MockInterview.mockId, mockId));

  return true;
}

export async function listAnswers(identity, mockId) {
  const interview = await getInterview(identity, mockId);

  if (!interview) {
    return null;
  }

  const answers = await db
    .select()
    .from(UserAnswer)
    .where(eq(UserAnswer.mockIdRef, mockId))
    .orderBy(UserAnswer.id);

  return {
    interview,
    answers,
  };
}

export async function saveEvaluatedAnswer({ identity, interview, answerInput, aiResult }) {
  const feedback = aiResult.data;
  const traceId = crypto.randomUUID();

  const inserted = await db
    .insert(UserAnswer)
    .values({
      mockIdRef: interview.mockId,
      questionId: answerInput.questionId || `q${(answerInput.activeQuestionIndex ?? 0) + 1}`,
      question: answerInput.question,
      correctAns: feedback.idealAnswer || answerInput.correctAns,
      userAnswer: answerInput.userAnswer,
      feedback: feedback.feedback,
      rating: String(feedback.rating),
      normalizedRating: String(feedback.rating),
      scores: feedback.scores,
      coachingTips: feedback.coachingTips,
      communicationMetrics: feedback.communicationMetrics,
      userEmail: identity.email,
      userId: identity.userId,
      createdAt: today(),
    })
    .returning();

  await saveTrace({
    traceId,
    mockId: interview.mockId,
    identity,
    eventType: "answer_evaluation",
    aiResult,
    payload: {
      questionId: answerInput.questionId,
      rating: feedback.rating,
    },
  });

  return inserted[0];
}

export async function markInterviewComplete(identity, mockId, report) {
  const values = {
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  if (report?.averageRating) {
    values.overallRating = String(report.averageRating);
  }

  await db
    .update(MockInterview)
    .set(values)
    .where(and(eq(MockInterview.mockId, mockId), ownerFilter(identity)));
}

export async function getProfile(identity) {
  const result = await db
    .select()
    .from(CandidateProfile)
    .where(eq(CandidateProfile.userId, identity.userId))
    .limit(1);

  return result[0] || null;
}

export async function upsertProfile(identity, input) {
  const existing = await getProfile(identity);

  if (existing) {
    const updated = await db
      .update(CandidateProfile)
      .set({
        ...input,
        userEmail: identity.email,
        updatedAt: new Date(),
      })
      .where(eq(CandidateProfile.userId, identity.userId))
      .returning();

    return updated[0];
  }

  const inserted = await db
    .insert(CandidateProfile)
    .values({
      ...input,
      userId: identity.userId,
      userEmail: identity.email,
    })
    .returning();

  return inserted[0];
}

export async function savePracticePlan({ identity, mockId, plan }) {
  const inserted = await db
    .insert(PracticePlan)
    .values({
      planId: crypto.randomUUID(),
      mockIdRef: mockId,
      userId: identity.userId,
      summary: plan.summary,
      focusAreas: plan.focusAreas,
      drills: plan.drills,
      resources: plan.resources,
    })
    .returning();

  return inserted[0];
}

async function saveTrace({ traceId, mockId, identity, eventType, aiResult, payload }) {
  await db.insert(InterviewTrace).values({
    traceId,
    mockIdRef: mockId,
    userId: identity.userId,
    eventType,
    model: aiResult.model,
    promptVersion: aiResult.promptVersion,
    latencyMs: aiResult.latencyMs,
    inputTokens: aiResult.usage?.promptTokenCount || null,
    outputTokens: aiResult.usage?.candidatesTokenCount || null,
    success: true,
    payload,
  });
}
