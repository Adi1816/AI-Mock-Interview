ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "interviewType" varchar DEFAULT 'technical' NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "difficulty" varchar DEFAULT 'mid' NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "targetCompany" varchar;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "resumeText" text;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "companyContext" text;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "questionCount" integer DEFAULT 10 NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "createdByEmail" varchar;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "createdAtTs" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "completedAt" timestamp with time zone;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'ready' NOT NULL;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "aiModel" varchar;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "aiTraceId" varchar;
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "overallRating" numeric(4, 2);
ALTER TABLE "mock_interview" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "questionId" varchar;
ALTER TABLE "userAnswer" ALTER COLUMN "question" TYPE text;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "normalizedRating" numeric(4, 2);
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "scores" jsonb;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "coachingTips" jsonb;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "communicationMetrics" jsonb;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "userId" varchar;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "attemptNumber" integer DEFAULT 1 NOT NULL;
ALTER TABLE "userAnswer" ADD COLUMN IF NOT EXISTS "createdAtTs" timestamp with time zone DEFAULT now() NOT NULL;

CREATE TABLE IF NOT EXISTS "interviewTrace" (
  "id" serial PRIMARY KEY,
  "traceId" varchar NOT NULL,
  "mockId" varchar NOT NULL,
  "userId" varchar NOT NULL,
  "eventType" varchar NOT NULL,
  "model" varchar,
  "promptVersion" varchar,
  "latencyMs" integer,
  "inputTokens" integer,
  "outputTokens" integer,
  "costUsd" numeric(10, 6),
  "success" boolean DEFAULT true NOT NULL,
  "error" text,
  "payload" jsonb,
  "createdAtTs" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "candidateProfile" (
  "id" serial PRIMARY KEY,
  "userId" varchar NOT NULL,
  "userEmail" varchar,
  "targetRoles" text,
  "skills" text,
  "resumeText" text,
  "resumeFileName" varchar,
  "careerGoals" text,
  "preferences" jsonb,
  "createdAtTs" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "candidateProfile" ADD COLUMN IF NOT EXISTS "resumeFileName" varchar;

CREATE TABLE IF NOT EXISTS "practicePlan" (
  "id" serial PRIMARY KEY,
  "planId" varchar NOT NULL,
  "mockId" varchar NOT NULL,
  "userId" varchar NOT NULL,
  "summary" text NOT NULL,
  "focusAreas" jsonb,
  "drills" jsonb,
  "resources" jsonb,
  "createdAtTs" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "mock_interview_mock_id_idx" ON "mock_interview" ("mockId");
CREATE INDEX IF NOT EXISTS "mock_interview_created_by_idx" ON "mock_interview" ("createdBy");
CREATE INDEX IF NOT EXISTS "user_answer_mock_id_ref_idx" ON "userAnswer" ("mockId");
CREATE INDEX IF NOT EXISTS "user_answer_user_id_idx" ON "userAnswer" ("userId");
CREATE INDEX IF NOT EXISTS "interview_trace_trace_id_idx" ON "interviewTrace" ("traceId");
CREATE INDEX IF NOT EXISTS "interview_trace_mock_id_ref_idx" ON "interviewTrace" ("mockId");
CREATE UNIQUE INDEX IF NOT EXISTS "candidate_profile_user_id_idx" ON "candidateProfile" ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "practice_plan_plan_id_idx" ON "practicePlan" ("planId");
CREATE INDEX IF NOT EXISTS "practice_plan_mock_id_ref_idx" ON "practicePlan" ("mockId");
