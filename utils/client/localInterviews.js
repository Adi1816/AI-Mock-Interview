const LOCAL_INTERVIEWS_KEY = "ai-mock-interview-local-interviews";
const LOCAL_ANSWERS_KEY = "ai-mock-interview-local-answers";

function scopedKey(baseKey, userId) {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function parseQuestions(interview) {
  if (Array.isArray(interview?.questions)) {
    return interview.questions;
  }

  try {
    const parsed = JSON.parse(interview?.jsonMockResp || "{}");
    return parsed.interviewQuestions || parsed.interview_questions || [];
  } catch {
    return [];
  }
}

function normalizeLocalInterview(interview) {
  const questions = parseQuestions(interview);

  return {
    ...interview,
    questions,
    questionCount: interview.questionCount || questions.length,
    local: true,
    databaseConfigured: false,
  };
}

export function isLocalInterviewId(mockId) {
  return String(mockId || "").startsWith("local-");
}

export function listLocalInterviews(userId) {
  const interviews = readStorage(scopedKey(LOCAL_INTERVIEWS_KEY, userId), []);
  return Array.isArray(interviews) ? interviews.map(normalizeLocalInterview) : [];
}

export function saveLocalInterview(interview, userId) {
  const normalized = normalizeLocalInterview(interview);
  const interviews = listLocalInterviews(userId);
  const next = [normalized, ...interviews.filter((item) => item.mockId !== normalized.mockId)];
  writeStorage(scopedKey(LOCAL_INTERVIEWS_KEY, userId), next);
  return normalized;
}

export function getLocalInterview(mockId, userId) {
  return listLocalInterviews(userId).find((interview) => interview.mockId === mockId) || null;
}

export function deleteLocalInterview(mockId, userId) {
  const interviews = listLocalInterviews(userId).filter((interview) => interview.mockId !== mockId);
  const answerMap = readStorage(scopedKey(LOCAL_ANSWERS_KEY, userId), {});
  delete answerMap[mockId];
  writeStorage(scopedKey(LOCAL_INTERVIEWS_KEY, userId), interviews);
  writeStorage(scopedKey(LOCAL_ANSWERS_KEY, userId), answerMap);
}

export function listLocalAnswers(mockId, userId) {
  const answerMap = readStorage(scopedKey(LOCAL_ANSWERS_KEY, userId), {});
  const answers = answerMap[mockId];
  return Array.isArray(answers) ? answers : [];
}

export function saveLocalAnswer({ mockId, answerInput, feedback, userId }) {
  const answerMap = readStorage(scopedKey(LOCAL_ANSWERS_KEY, userId), {});
  const answers = Array.isArray(answerMap[mockId]) ? answerMap[mockId] : [];
  const questionId = answerInput.questionId || `q${(answerInput.activeQuestionIndex ?? 0) + 1}`;
  const savedAnswer = {
    id: `${mockId}-${questionId}`,
    mockIdRef: mockId,
    questionId,
    question: answerInput.question,
    correctAns: feedback.idealAnswer || answerInput.correctAns,
    userAnswer: answerInput.userAnswer,
    feedback: feedback.feedback,
    rating: String(feedback.rating),
    normalizedRating: String(feedback.rating),
    scores: feedback.scores || {},
    coachingTips: feedback.coachingTips || [],
    communicationMetrics: feedback.communicationMetrics || {},
    createdAt: new Date().toISOString(),
  };
  const existingIndex = answers.findIndex((answer) => answer.questionId === questionId);
  const nextAnswers =
    existingIndex >= 0
      ? answers.map((answer, index) => (index === existingIndex ? savedAnswer : answer))
      : [...answers, savedAnswer];

  answerMap[mockId] = nextAnswers;
  writeStorage(scopedKey(LOCAL_ANSWERS_KEY, userId), answerMap);
  return savedAnswer;
}

export function buildLocalReport({ interview, answers }) {
  const ratings = answers
    .map((answer) => Number(answer.normalizedRating ?? answer.rating))
    .filter((rating) => Number.isFinite(rating));
  const averageRating =
    ratings.length > 0
      ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
      : 0;
  const scoreBuckets = answers.reduce(
    (acc, answer) => {
      const scores = answer.scores || {};
      Object.keys(acc).forEach((key) => {
        if (Number.isFinite(Number(scores[key]))) {
          acc[key].push(Number(scores[key]));
        }
      });
      return acc;
    },
    {
      correctness: [],
      completeness: [],
      clarity: [],
      tradeoffs: [],
      communication: [],
    }
  );
  const categoryScores = Object.fromEntries(
    Object.entries(scoreBuckets).map(([key, values]) => [
      key,
      values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0,
    ])
  );
  const weakAreas = Object.entries(categoryScores)
    .filter(([, score]) => score > 0 && score < 3.5)
    .map(([area]) => area);

  return {
    interviewId: interview.mockId,
    role: interview.jobPosition,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    answeredQuestions: answers.length,
    totalQuestions: interview.questionCount || parseQuestions(interview).length,
    averageRating,
    categoryScores,
    weakAreas,
    topCoachingTips: answers.flatMap((answer) => answer.coachingTips || []).slice(0, 8),
    readiness:
      averageRating >= 4
        ? "Strong"
        : averageRating >= 3
          ? "Promising, needs targeted practice"
          : "Needs more practice before high-stakes interviews",
  };
}

export function buildLocalPracticePlan({ interview, report }) {
  const focusAreas = report.weakAreas?.length ? report.weakAreas : ["clarity", "examples", "tradeoffs"];

  return {
    summary: `Practice ${focusAreas.slice(0, 3).join(", ")} before your next ${interview.interviewType} interview.`,
    focusAreas,
    drills: focusAreas.slice(0, 4).map((area) => ({
      title: `${area[0].toUpperCase()}${area.slice(1)} sprint`,
      description: "Record one answer, rewrite it with a clearer structure, then re-record under two minutes.",
      targetSkill: area,
      estimatedMinutes: 25,
    })),
    resources: [
      `Revise ${interview.techStacks || "your selected stack"} fundamentals`,
      "Prepare three STAR stories with measurable impact",
      "Run one timed mock session and compare scores",
    ],
  };
}
