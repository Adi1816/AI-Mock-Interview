import { z } from "zod";

const asTrimmedString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const textField = (schema) => z.preprocess(asTrimmedString, schema);
const nonEmptyText = textField(z.string().min(1));
const boundedText = (min, max) => textField(z.string().min(min).max(max));
const optionalText = z.preprocess(asTrimmedString, z.string()).optional().default("");

export const interviewRequestSchema = z.object({
  jobTitle: boundedText(2, 120),
  jobDescription: optionalText,
  techStacks: boundedText(2, 1000),
  duration: z.preprocess((value) => (value === "" || value === null || value === undefined ? 0 : value), z.coerce.number().min(0).max(50)),
  interviewType: z
    .enum(["technical", "behavioral", "system-design", "dsa", "frontend", "backend", "ml", "hr"])
    .default("technical"),
  difficulty: z.enum(["junior", "mid", "senior", "staff"]).default("mid"),
  targetCompany: optionalText,
  resumeText: optionalText,
  companyContext: optionalText,
  questionCount: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? 8 : value),
    z.coerce.number().int().min(3).max(12).default(8)
  ),
});

export const generatedQuestionSchema = z.object({
  id: z.string().optional(),
  ques: nonEmptyText,
  ans: nonEmptyText,
  category: z.string().optional(),
  difficulty: z.string().optional(),
  rubric: z
    .array(
      z.object({
        criterion: nonEmptyText,
        weight: z.coerce.number().min(0).max(100),
      })
    )
    .optional(),
  followUps: z.array(z.string()).optional(),
});

export const generatedInterviewSchema = z.object({
  interviewQuestions: z.array(generatedQuestionSchema).min(1),
  rubric: z
    .object({
      correctness: z.coerce.number().min(0).max(100).default(40),
      completeness: z.coerce.number().min(0).max(100).default(20),
      clarity: z.coerce.number().min(0).max(100).default(20),
      tradeoffs: z.coerce.number().min(0).max(100).default(10),
      communication: z.coerce.number().min(0).max(100).default(10),
    })
    .default({ correctness: 40, completeness: 20, clarity: 20, tradeoffs: 10, communication: 10 }),
  metadata: z
    .object({
      estimatedDurationMinutes: z.coerce.number().min(5).max(90).optional(),
      roleFitFocus: z.array(z.string()).optional(),
      detectedSkillGaps: z.array(z.string()).optional(),
    })
    .optional(),
});

export const answerRequestSchema = z.object({
  questionId: z.string().optional(),
  question: nonEmptyText,
  correctAns: nonEmptyText,
  userAnswer: boundedText(5, 10000),
  activeQuestionIndex: z.coerce.number().int().min(0).optional(),
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().min(0).max(5),
  feedback: nonEmptyText,
  scores: z
    .object({
      correctness: z.coerce.number().min(0).max(5).default(0),
      completeness: z.coerce.number().min(0).max(5).default(0),
      clarity: z.coerce.number().min(0).max(5).default(0),
      tradeoffs: z.coerce.number().min(0).max(5).default(0),
      communication: z.coerce.number().min(0).max(5).default(0),
    })
    .default({ correctness: 0, completeness: 0, clarity: 0, tradeoffs: 0, communication: 0 }),
  strengths: z.array(z.string()).default([]),
  coachingTips: z.array(z.string()).default([]),
  idealAnswer: z.string().optional(),
  followUpQuestion: z.string().optional(),
  riskFlags: z.array(z.string()).default([]),
});

export const profileSchema = z.object({
  targetRoles: optionalText,
  skills: optionalText,
  resumeText: optionalText,
  resumeFileName: optionalText,
  careerGoals: optionalText,
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export const practicePlanSchema = z.object({
  summary: nonEmptyText,
  focusAreas: z.array(z.string()).default([]),
  drills: z
    .array(
      z.object({
        title: nonEmptyText,
        description: nonEmptyText,
        targetSkill: z.string().optional(),
        estimatedMinutes: z.coerce.number().min(5).max(180).optional(),
      })
    )
    .default([]),
  resources: z.array(z.string()).default([]),
});
