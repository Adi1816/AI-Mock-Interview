import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const MockInterview = pgTable(
  "mock_interview",
  {
    id: serial("id").primaryKey(),
    mockId: varchar("mockId").notNull(),
    jsonMockResp: text("jsonMockResp").notNull(),
    jobPosition: varchar("jobPosition").notNull(),
    techStacks: varchar("techStacks").notNull(),
    jobDescription: varchar("jobDescription").notNull(),
    jobExperience: varchar("jobExperience").notNull(),
    interviewType: varchar("interviewType").default("technical").notNull(),
    difficulty: varchar("difficulty").default("mid").notNull(),
    targetCompany: varchar("targetCompany"),
    resumeText: text("resumeText"),
    companyContext: text("companyContext"),
    questionCount: integer("questionCount").default(10).notNull(),
    createdBy: varchar("createdBy").notNull(),
    createdByEmail: varchar("createdByEmail"),
    createdAt: varchar("createdAt").notNull(),
    createdAtTs: timestamp("createdAtTs", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true }),
    status: varchar("status").default("draft").notNull(),
    aiModel: varchar("aiModel"),
    aiTraceId: varchar("aiTraceId"),
    overallRating: numeric("overallRating", { precision: 4, scale: 2 }),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    mockIdIdx: uniqueIndex("mock_interview_mock_id_idx").on(table.mockId),
    createdByIdx: index("mock_interview_created_by_idx").on(table.createdBy),
  })
);

export const UserAnswer = pgTable(
  "userAnswer",
  {
    id: serial("id").primaryKey(),
    mockIdRef: varchar("mockId").notNull(),
    questionId: varchar("questionId"),
    question: text("question").notNull(),
    correctAns: text("correctAns"),
    userAnswer: text("userAnswer"),
    feedback: text("feedback"),
    rating: varchar("rating"),
    normalizedRating: numeric("normalizedRating", { precision: 4, scale: 2 }),
    scores: jsonb("scores"),
    coachingTips: jsonb("coachingTips"),
    communicationMetrics: jsonb("communicationMetrics"),
    userEmail: varchar("userEmail"),
    userId: varchar("userId"),
    attemptNumber: integer("attemptNumber").default(1).notNull(),
    createdAt: varchar("createdAt"),
    createdAtTs: timestamp("createdAtTs", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    mockIdRefIdx: index("user_answer_mock_id_ref_idx").on(table.mockIdRef),
    userIdIdx: index("user_answer_user_id_idx").on(table.userId),
  })
);

export const InterviewTrace = pgTable(
  "interviewTrace",
  {
    id: serial("id").primaryKey(),
    traceId: varchar("traceId").notNull(),
    mockIdRef: varchar("mockId").notNull(),
    userId: varchar("userId").notNull(),
    eventType: varchar("eventType").notNull(),
    model: varchar("model"),
    promptVersion: varchar("promptVersion"),
    latencyMs: integer("latencyMs"),
    inputTokens: integer("inputTokens"),
    outputTokens: integer("outputTokens"),
    costUsd: numeric("costUsd", { precision: 10, scale: 6 }),
    success: boolean("success").default(true).notNull(),
    error: text("error"),
    payload: jsonb("payload"),
    createdAtTs: timestamp("createdAtTs", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    traceIdIdx: index("interview_trace_trace_id_idx").on(table.traceId),
    mockIdRefIdx: index("interview_trace_mock_id_ref_idx").on(table.mockIdRef),
  })
);

export const CandidateProfile = pgTable(
  "candidateProfile",
  {
    id: serial("id").primaryKey(),
    userId: varchar("userId").notNull(),
    userEmail: varchar("userEmail"),
    targetRoles: text("targetRoles"),
    skills: text("skills"),
    resumeText: text("resumeText"),
    resumeFileName: varchar("resumeFileName"),
    careerGoals: text("careerGoals"),
    preferences: jsonb("preferences"),
    createdAtTs: timestamp("createdAtTs", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("candidate_profile_user_id_idx").on(table.userId),
  })
);

export const PracticePlan = pgTable(
  "practicePlan",
  {
    id: serial("id").primaryKey(),
    planId: varchar("planId").notNull(),
    mockIdRef: varchar("mockId").notNull(),
    userId: varchar("userId").notNull(),
    summary: text("summary").notNull(),
    focusAreas: jsonb("focusAreas"),
    drills: jsonb("drills"),
    resources: jsonb("resources"),
    createdAtTs: timestamp("createdAtTs", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    planIdIdx: uniqueIndex("practice_plan_plan_id_idx").on(table.planId),
    mockIdRefIdx: index("practice_plan_mock_id_ref_idx").on(table.mockIdRef),
  })
);
