import { GoogleGenerativeAI } from "@google/generative-ai";
import { feedbackSchema, generatedInterviewSchema, practicePlanSchema } from "./validators";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const PROMPT_VERSION = "interview-platform-v3";
const FALLBACK_MODEL = "local-interview-engine";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for AI generation.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.45,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
}

function parseJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate);
}

async function generateJson({ prompt, schema }) {
  const model = getModel();
  const startedAt = Date.now();
  const result = await model.generateContent(prompt);
  const latencyMs = Date.now() - startedAt;
  const text = result.response.text();
  const json = parseJson(text);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`AI response failed schema validation: ${parsed.error.message}`);
  }

  return {
    data: parsed.data,
    rawText: text,
    latencyMs,
    usage: result.response.usageMetadata || null,
    model: DEFAULT_MODEL,
    promptVersion: PROMPT_VERSION,
  };
}

function listFromText(text) {
  return String(text || "")
    .split(/[,.\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function wordsFromText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3);
}

function createLocalResult({ data, latencyMs = 0, fallbackReason }) {
  return {
    data,
    rawText: JSON.stringify(data),
    latencyMs,
    usage: null,
    model: FALLBACK_MODEL,
    promptVersion: `${PROMPT_VERSION}-fallback`,
    fallbackReason,
  };
}

function clampScore(value, min = 0, max = 5) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Number(Math.min(max, Math.max(min, number)).toFixed(1));
}

function skillSummary(input) {
  const skills = listFromText(input.techStacks).slice(0, 5);
  return skills.length ? skills.join(", ") : "the selected stack";
}

function inferQuestionType(input) {
  const stack = `${input.techStacks || ""} ${input.jobTitle || ""}`.toLowerCase();

  if (input.interviewType === "technical" && /\b(dsa|algorithm|leetcode|array|graph|tree|dynamic programming|recursion)\b/.test(stack)) {
    return "dsa";
  }

  if (input.interviewType === "technical" && /\b(react|next|frontend|css|browser|typescript|javascript)\b/.test(stack)) {
    return "frontend";
  }

  if (input.interviewType === "technical" && /\b(node|api|backend|postgres|sql|database|server|redis|queue)\b/.test(stack)) {
    return "backend";
  }

  return input.interviewType || "technical";
}

function normalizeQuestionKey(question) {
  return String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !["would", "explain", "describe", "interview"].includes(word))
    .slice(0, 14)
    .join(" ");
}

function localQuestionsFor(input) {
  const role = input.jobTitle || "the role";
  const stack = skillSummary(input);
  const difficulty = input.difficulty || "mid";
  const questionType = inferQuestionType(input);

  const templates = {
    technical: [
      [
        `Explain a production feature you would build for ${role} using ${stack}. Which architecture choices matter most?`,
        "A strong answer frames the user problem, proposes clear components, explains data flow, calls out reliability and security concerns, and justifies tradeoffs instead of only listing tools.",
      ],
      [
        `How would you debug a slow or failing ${stack} service in production?`,
        "Start with reproduction and logs, inspect metrics and traces, isolate recent changes, check data and dependency behavior, add targeted instrumentation, then fix and verify with tests and monitoring.",
      ],
      [
        `Describe the difference between a quick implementation and a maintainable implementation for this role.`,
        "A maintainable implementation has clear boundaries, tests, observability, readable error handling, documented assumptions, and avoids overengineering while leaving room for likely future changes.",
      ],
      [
        `Pick one project in ${stack}. How would you explain the hardest technical decision to a senior engineer?`,
        "A strong answer states the context, constraints, alternatives considered, final decision, tradeoffs, and what was measured after shipping.",
      ],
      [
        `How would you design tests for a critical feature in ${stack}?`,
        "Cover unit, integration, end-to-end, contract, and regression tests; prioritize behavior and risk instead of implementation details only.",
      ],
      [
        `What failure modes would you watch for when deploying a ${stack} feature?`,
        "Discuss validation, dependency failures, performance regressions, data consistency, auth/security, rollback strategy, and monitoring.",
      ],
      [
        `How do you decide when to refactor versus ship a small fix in ${stack}?`,
        "Balance user impact, risk, code ownership, test coverage, future change probability, and whether the current design blocks safe delivery.",
      ],
      [
        `Explain a technical concept from ${stack} as if the interviewer asked you to teach it clearly.`,
        "A strong answer uses a simple definition, concrete example, common pitfalls, and how it appears in real project work.",
      ],
    ],
    "system-design": [
      [
        `Design a scalable service for a ${role} product. What are the core APIs, data model, and reliability risks?`,
        "A strong answer clarifies requirements, defines APIs, models entities and access patterns, chooses storage deliberately, discusses caching and queues, and covers bottlenecks, failure modes, and observability.",
      ],
      [
        "How would you handle traffic spikes, retries, and duplicate requests in this system?",
        "Use rate limits, queues, idempotency keys, backoff, circuit breakers, cache where appropriate, and monitor saturation. The answer should explain tradeoffs and user-facing failure behavior.",
      ],
      [
        "What metrics and alerts would prove this system is healthy?",
        "Cover latency, error rate, throughput, saturation, queue lag, database performance, business success metrics, and alerts tied to user impact rather than noisy internals only.",
      ],
      [
        "Design the data model and indexes for the most important entity in this system.",
        "A strong answer names entities, relationships, access patterns, constraints, indexes, and how the model changes as scale grows.",
      ],
      [
        "How would you make this design secure for multiple users or tenants?",
        "Cover authentication, authorization, ownership checks, secrets, data isolation, audit logs, and least-privilege access.",
      ],
      [
        "Where would you use caching, and where would caching be dangerous?",
        "Discuss read patterns, invalidation, freshness, cache keys, stampedes, sensitive data, and fallback behavior.",
      ],
      [
        "How would you evolve the system from MVP to high scale without rewriting everything?",
        "A strong answer separates current constraints from future seams, migration strategy, observability, and reversible architecture choices.",
      ],
      [
        "What are the top three bottlenecks in your design and how would you test them?",
        "Name concrete bottlenecks, load-test strategy, metrics, thresholds, and mitigations.",
      ],
    ],
    dsa: [
      [
        "Given an array of integers and a target, return the indices of two numbers that add up to the target. Explain the optimal approach and complexity.",
        "Use a hash map from value to index while scanning once. For each number, check whether target minus number was seen. Time is O(n), space is O(n), and edge cases include duplicates and negative values.",
      ],
      [
        "Find the length of the longest substring without repeating characters. Walk through the sliding window invariant.",
        "Maintain a window with unique characters and a map of last seen positions. Move the left pointer past duplicates and update the best length. Time is O(n), space is O(min(n, charset)).",
      ],
      [
        "Given a grid with blocked cells, find the shortest path from top-left to bottom-right. Which graph traversal would you use and why?",
        "Model cells as graph nodes and use BFS for unweighted shortest path. Track visited cells, validate bounds and blocked cells, and return distance when the destination is reached.",
      ],
      [
        "Given coin denominations and an amount, compute the minimum number of coins needed. Explain the dynamic programming state.",
        "Use dp[x] as the minimum coins needed for amount x. Initialize dp[0]=0, relax each amount with each coin, and return impossible if dp[amount] stays infinite. Time is O(amount * coins).",
      ],
      [
        "Merge overlapping intervals and explain how sorting helps.",
        "Sort by interval start, keep a result list, and merge when the next start is within the previous end. Time is O(n log n), space is O(n) for output.",
      ],
      [
        "Detect whether a linked list has a cycle and identify the reasoning behind the two-pointer method.",
        "Use slow and fast pointers. If they meet, a cycle exists; if fast reaches null, no cycle exists. The speed difference guarantees detection inside a cycle.",
      ],
      [
        "Given a binary tree, return the level-order traversal. What data structure do you use?",
        "Use a queue for BFS. Process one level at a time, enqueue children, and collect values per level. Time is O(n), space is O(width).",
      ],
      [
        "Generate all valid subsets or combinations for a small input. Explain the backtracking decision tree.",
        "At each index choose include or exclude, carry the current path, append when the decision reaches the end, and backtrack to explore all branches.",
      ],
    ],
    frontend: [
      [
        `How would you structure a complex ${stack} UI so it remains fast, accessible, and maintainable?`,
        "A strong answer separates state, rendering, data fetching, error states, and reusable components; it covers accessibility, performance profiling, and predictable testing.",
      ],
      [
        "How do you diagnose a UI that feels slow even when the API is fast?",
        "Inspect render frequency, bundle size, expensive calculations, layout shifts, image loading, hydration, network waterfalls, and user-centric metrics such as INP and LCP.",
      ],
      [
        "What tradeoffs do you consider when choosing client state, server state, and URL state?",
        "Discuss persistence, shareability, caching, invalidation, synchronization, privacy, and how each state type affects debugging and user experience.",
      ],
      [
        "How would you make a complex form reliable and accessible?",
        "Cover semantic labels, validation timing, error states, keyboard flow, async submission, disabled states, and recovery from failed requests.",
      ],
      [
        "How do hydration, server rendering, and client components affect a Next.js app?",
        "Explain what renders on the server, what hydrates in the browser, where state lives, and how to avoid mismatches or unnecessary client code.",
      ],
      [
        "How would you prevent layout shift in a dashboard with dynamic data?",
        "Use stable dimensions, skeleton states, reserved image/media space, predictable grid tracks, and avoid content-dependent container resizing.",
      ],
      [
        "How do you debug a browser-only production bug?",
        "Use reproduction details, browser devtools, source maps, logging, feature flags, environment checks, and targeted regression tests.",
      ],
      [
        "What accessibility checks would you run before shipping a UI component?",
        "Check labels, roles, keyboard navigation, focus states, contrast, reduced motion, screen reader names, and error announcement.",
      ],
    ],
    backend: [
      [
        `Design a backend workflow in ${stack} that must be reliable under concurrency.`,
        "A strong answer covers transactions, idempotency, locking or optimistic concurrency, retries, queueing, validation, and observable failure handling.",
      ],
      [
        "How would you design authorization for a multi-user interview platform?",
        "Use user identity from the auth provider, persist ownership, enforce checks on every server route, avoid trusting client ids, and audit sensitive reads and writes.",
      ],
      [
        "What database indexes or schema changes would you consider as usage grows?",
        "Tie indexes to query patterns, avoid unnecessary indexes, discuss uniqueness, foreign-key-like references, pagination, archival, and migration strategy.",
      ],
      [
        "How would you design idempotent API endpoints for retries?",
        "Use idempotency keys, deterministic request identity, transactional writes, conflict handling, and clear response behavior for duplicate attempts.",
      ],
      [
        "How would you handle a slow third-party dependency in a backend flow?",
        "Use timeouts, retries with backoff, circuit breakers, queues, fallbacks, observability, and user-facing status handling.",
      ],
      [
        "What is your approach to secrets and environment configuration?",
        "Keep secrets server-side, avoid client exposure, rotate leaked keys, scope permissions, validate required env vars, and separate dev/prod configs.",
      ],
      [
        "How would you paginate a high-volume API safely?",
        "Prefer cursor pagination for large changing datasets, index the cursor columns, define stable ordering, and avoid expensive offset scans.",
      ],
      [
        "How do you trace a request across services?",
        "Use request ids, structured logs, distributed traces, metrics, and consistent error boundaries across each service hop.",
      ],
    ],
    behavioral: [
      [
        "Tell me about a time you owned an ambiguous problem from start to finish.",
        "Use a concise STAR structure: situation, task, action, result. Strong answers show ownership, tradeoffs, communication, and measurable impact.",
      ],
      [
        "Describe a conflict with a teammate or stakeholder and how you handled it.",
        "A strong answer avoids blame, explains the disagreement, shows active listening, describes the resolution path, and names what changed afterward.",
      ],
      [
        "Tell me about a time you learned something quickly for a project.",
        "Explain the gap, learning plan, resources used, how learning was applied, and the outcome. Strong answers include evidence and reflection.",
      ],
      [
        "Tell me about a time you received critical feedback and changed your approach.",
        "A strong answer shows openness, the specific feedback, action taken, and a measurable improvement afterward.",
      ],
      [
        "Describe a time you had to push back on scope or timeline.",
        "Explain the risk, how you communicated it, alternatives proposed, and how the team aligned on a practical plan.",
      ],
      [
        "Tell me about your most impactful project and how you measured success.",
        "A good answer includes the goal, your ownership, constraints, decisions, metrics, and learning.",
      ],
      [
        "Describe a time you worked with ambiguity.",
        "Strong answers show how you clarified goals, created checkpoints, made reversible decisions, and kept stakeholders informed.",
      ],
      [
        "Tell me about a mistake you made and how you handled it.",
        "A strong answer takes ownership, explains mitigation, communication, and what changed to prevent recurrence.",
      ],
    ],
    hr: [
      [
        `Why are you interested in ${role}, and how does it connect to your recent work?`,
        "A strong answer connects motivation, role fit, relevant skills, learning goals, and what the candidate can contribute without sounding generic.",
      ],
      [
        "What kind of team environment helps you do your best work?",
        "A good response is specific about collaboration, feedback, ownership, communication style, and how the candidate adapts to different teams.",
      ],
      [
        "How would you explain your compensation expectations professionally?",
        "A strong answer anchors around role scope, market research, flexibility, and total compensation while keeping the conversation collaborative.",
      ],
    ],
    ml: [
      [
        `How would you design an ML-backed feature for ${role} and evaluate whether it is useful?`,
        "A strong answer defines the product objective, data sources, baseline, model choice, evaluation metrics, monitoring, drift handling, and human fallback.",
      ],
      [
        "How do you debug a model that performs well offline but poorly in production?",
        "Compare train and production distributions, data quality, leakage, metric mismatch, latency constraints, feedback loops, and monitoring gaps.",
      ],
      [
        "What safety and privacy concerns matter when using candidate or user data?",
        "Cover consent, minimization, retention, access controls, evaluation bias, explainability, and secure handling of sensitive data.",
      ],
    ],
  };

  const selected = templates[questionType] || templates.technical;
  const count = Number(input.questionCount || 8);
  const resumeSignals = wordsFromText(input.resumeText).slice(0, 4);

  return Array.from({ length: count }, (_, index) => {
    const [question, answer] = selected[index % selected.length];
    const resumeHint =
      resumeSignals.length && index % 3 === 0
        ? ` Relate the answer to candidate experience around ${resumeSignals.join(", ")} when relevant.`
        : "";

    return {
      id: `q${index + 1}`,
      ques: `${question}${resumeHint}`,
      ans: answer,
      category: questionType,
      difficulty,
      rubric: [
        { criterion: "Correct technical or behavioral substance", weight: 40 },
        { criterion: "Completeness and specific examples", weight: 25 },
        { criterion: "Clear structure and communication", weight: 20 },
        { criterion: "Tradeoffs, risks, and follow-up depth", weight: 15 },
      ],
      followUps: [
        "What tradeoff would you revisit if constraints changed?",
        "How would you validate that this answer works in production?",
      ],
    };
  });
}

function generateLocalInterviewPlan(input, error) {
  const startedAt = Date.now();
  const questions = localQuestionsFor(input);
  const data = {
    interviewQuestions: questions,
    rubric: {
      correctness: 40,
      completeness: 20,
      clarity: 20,
      tradeoffs: 10,
      communication: 10,
    },
    metadata: {
      estimatedDurationMinutes: Math.max(15, questions.length * 6),
      roleFitFocus: [input.jobTitle, skillSummary(input), input.interviewType].filter(Boolean),
      detectedSkillGaps: input.resumeText ? [] : ["Resume context not provided"],
    },
  };

  return createLocalResult({
    data,
    latencyMs: Date.now() - startedAt,
    fallbackReason: error?.message || "Gemini is not configured",
  });
}

function ensureDistinctQuestions(questions, input) {
  const desiredCount = Number(input.questionCount || questions.length || 8);
  const fallbackPool = localQuestionsFor({
    ...input,
    questionCount: Math.max(12, desiredCount),
  });
  const output = [];
  const seen = new Set();

  for (const question of [...questions, ...fallbackPool]) {
    const key = normalizeQuestionKey(question.ques);

    if (!key || seen.has(key)) {
      continue;
    }

    output.push(question);
    seen.add(key);

    if (output.length >= desiredCount) {
      break;
    }
  }

  while (output.length < desiredCount) {
    const index = output.length + 1;
    const stack = skillSummary(input);
    const questionType = inferQuestionType(input);
    const supplemental =
      questionType === "dsa"
        ? {
            ques: `Solve a ${stack} problem variant ${index}: state the brute-force approach, optimize it, and analyze edge cases and complexity.`,
            ans: "Start from brute force to clarify correctness, identify repeated work or useful ordering, choose an appropriate data structure or pattern, then prove complexity and test boundary cases.",
          }
        : {
            ques: `Deep dive ${index}: explain a distinct ${stack} decision you would make for ${input.jobTitle} and the tradeoff behind it.`,
            ans: "State the decision, compare alternatives, justify the chosen approach with constraints, identify risks, and describe how you would validate it in production.",
          };
    const key = normalizeQuestionKey(supplemental.ques);

    if (!seen.has(key)) {
      output.push({
        id: `q${index}`,
        ...supplemental,
        category: questionType,
        difficulty: input.difficulty || "mid",
        rubric: [
          { criterion: "Correctness and depth", weight: 40 },
          { criterion: "Specific examples or dry run", weight: 25 },
          { criterion: "Clear structure", weight: 20 },
          { criterion: "Tradeoffs and edge cases", weight: 15 },
        ],
        followUps: ["What edge case would change your approach?"],
      });
      seen.add(key);
    }
  }

  return output.map((question, index) => ({
    ...question,
    id: `q${index + 1}`,
  }));
}

export function analyzeCommunication(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const lowerWords = words.map((word) => word.toLowerCase().replace(/[^a-z]/g, ""));
  const fillerTerms = new Set(["um", "uh", "like", "actually", "basically", "literally", "so"]);
  const fillerWords = lowerWords.filter((word) => fillerTerms.has(word));
  const uniqueWords = new Set(lowerWords.filter(Boolean));
  const sentenceCount = Math.max(1, answer.split(/[.!?]+/).filter((part) => part.trim()).length);
  const avgSentenceLength = words.length / sentenceCount;

  return {
    wordCount: words.length,
    sentenceCount,
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
    fillerWordCount: fillerWords.length,
    fillerWordRate: words.length ? Number(((fillerWords.length / words.length) * 100).toFixed(1)) : 0,
    lexicalDiversity: words.length ? Number((uniqueWords.size / words.length).toFixed(2)) : 0,
    structureSignals: {
      mentionsTradeoffs: /\b(trade[- ]?off|however|although|but|risk|cost)\b/i.test(answer),
      mentionsExample: /\b(for example|for instance|in my project|i built|i used)\b/i.test(answer),
      hasConclusion: /\b(overall|therefore|so i would|in summary)\b/i.test(answer),
    },
  };
}

export async function generateInterviewPlan(input) {
  const questionType = inferQuestionType(input);
  const focusAreas = listFromText(input.techStacks).slice(0, 8);
  const contextParts = [
    `Role: ${input.jobTitle}`,
    `Experience: ${input.duration} years`,
    `Tech stack: ${input.techStacks}`,
    `Interview type: ${input.interviewType}`,
    `Question family to prioritize: ${questionType}`,
    `Difficulty: ${input.difficulty}`,
    `Interview focus: ${input.jobDescription}`,
  ];

  if (input.targetCompany) contextParts.push(`Target company: ${input.targetCompany}`);
  if (input.resumeText) contextParts.push(`Candidate resume/context: ${input.resumeText}`);
  if (input.companyContext) contextParts.push(`Company/interview context: ${input.companyContext}`);

  const prompt = `
You are a senior interview designer. Generate a realistic, role-specific mock interview plan.

 Requirements:
 - Output valid JSON only.
 - Return exactly ${input.questionCount} questions.
 - Every question must be unique. Do not repeat the same scenario, concept, or wording.
 - Each question must test a different skill from this coverage plan: ${focusAreas.join(", ") || "fundamentals, projects, debugging, tradeoffs"}.
 - The question family is "${questionType}". Make this more important than generic interview style.
 - If the question family is "dsa", ask concrete algorithmic coding problems with inputs, constraints, expected approach, edge cases, and complexity. Do not ask generic project-design questions.
 - If the question family is "frontend", test React/Next.js/browser/accessibility/performance specifics when present in the stack.
 - If the question family is "backend", test APIs, data modeling, concurrency, auth, storage, reliability, and observability when present in the stack.
 - Use the candidate resume and company context when present, but do not invent facts.
 - Mix conceptual, practical, project-based, and follow-up-ready questions.
 - Answers must be concise reference answers, not essays.
- Include a rubric for each question and an overall rubric.

JSON shape:
{
  "interviewQuestions": [
    {
      "id": "q1",
      "ques": "question text",
      "ans": "reference answer",
      "category": "technical|behavioral|system-design|dsa|communication",
      "difficulty": "junior|mid|senior|staff",
      "rubric": [{"criterion": "what to look for", "weight": 40}],
      "followUps": ["follow-up question"]
    }
  ],
  "rubric": {
    "correctness": 40,
    "completeness": 20,
    "clarity": 20,
    "tradeoffs": 10,
    "communication": 10
  },
  "metadata": {
    "estimatedDurationMinutes": 45,
    "roleFitFocus": ["skills being tested"],
      "detectedSkillGaps": ["possible gaps from resume or selected role context"]
  }
}

Context:
${contextParts.join("\n")}
`;

  let response;

  try {
    response = await generateJson({ prompt, schema: generatedInterviewSchema });
  } catch (error) {
    response = generateLocalInterviewPlan(input, error);
  }

  const interviewQuestions = ensureDistinctQuestions(response.data.interviewQuestions, input);

  return {
    ...response,
    data: {
      ...response.data,
      interviewQuestions,
    },
  };
}

function assessAnswerQuality({ question, correctAns, userAnswer, communicationMetrics }) {
  const rawAnswer = String(userAnswer || "").trim();
  const lowerAnswer = rawAnswer.toLowerCase();
  const answerTerms = new Set(wordsFromText(rawAnswer));
  const referenceTerms = new Set(
    wordsFromText(`${question} ${correctAns}`)
      .filter(
        (term) =>
          ![
            "answer",
            "question",
            "explain",
            "strong",
            "approach",
            "would",
            "should",
            "interview",
            "candidate",
          ].includes(term)
      )
      .slice(0, 60)
  );
  const matchedTerms = [...referenceTerms].filter((term) => answerTerms.has(term));
  const relevance = referenceTerms.size ? matchedTerms.length / referenceTerms.size : 0;
  const refusalPattern =
    /\b(i\s*(do\s*not|don't|dont)\s*know|idk|no idea|not sure|can't answer|cannot answer|i have no clue|i don't know anything|skip this|nothing to say)\b/i;
  const placeholderPattern = /\b(test answer|asdf|random answer|blah|lorem ipsum|no clue|whatever)\b/i;
  const wordCount = communicationMetrics.wordCount;
  const lowEffort = wordCount < 12 || rawAnswer.length < 45;
  const thinAnswer = wordCount < 28;
  const refusal = refusalPattern.test(lowerAnswer);
  const placeholder = placeholderPattern.test(lowerAnswer);
  const risks = [];
  let maxRating = 5;

  if (refusal || placeholder) {
    maxRating = 0.9;
    risks.push("Refusal or placeholder answer");
  } else if (lowEffort && relevance < 0.12) {
    maxRating = 1.4;
    risks.push("Very low detail");
    risks.push("Low relevance to the question");
  } else if (thinAnswer && relevance < 0.16) {
    maxRating = 2.0;
    risks.push("Thin answer");
    risks.push("Insufficient question coverage");
  } else if (relevance < 0.08) {
    maxRating = 2.2;
    risks.push("Likely off-topic");
  } else if (relevance < 0.16) {
    maxRating = 3.0;
    risks.push("Partial relevance");
  }

  if (!communicationMetrics.structureSignals.mentionsExample && wordCount > 25) {
    risks.push("No concrete example");
  }

  if (!communicationMetrics.structureSignals.mentionsTradeoffs && wordCount > 25) {
    risks.push("No tradeoff or edge-case discussion");
  }

  return {
    answerTerms,
    matchedTerms,
    maxRating,
    relevance: Number(relevance.toFixed(2)),
    refusal,
    placeholder,
    lowEffort,
    thinAnswer,
    riskFlags: risks,
  };
}

function makeLowSignalFeedback(assessment) {
  if (assessment.refusal || assessment.placeholder) {
    return "This response does not answer the question, so it cannot earn meaningful technical credit. A strong answer needs at least a direct approach, key concepts, edge cases, and a brief justification.";
  }

  if (assessment.lowEffort) {
    return "This answer is too short and too generic to demonstrate interview readiness. Expand it with a direct solution, reasoning, edge cases, complexity or tradeoffs, and one concrete example where relevant.";
  }

  if (assessment.relevance < 0.16) {
    return "This answer does not cover enough of the question-specific concepts. Re-anchor the response to the prompt, name the core approach, and explain why that approach is correct.";
  }

  return null;
}

function applyScoringGuardrails(feedback, assessment, correctAns, communicationMetrics) {
  const lowSignalFeedback = makeLowSignalFeedback(assessment);
  const rating = clampScore(Math.min(Number(feedback.rating || 0), assessment.maxRating));
  const rawScores = feedback.scores || {};
  const maxCategoryScore = assessment.maxRating <= 2 ? assessment.maxRating : 5;
  const scores =
    assessment.maxRating <= 1.4
      ? {
          correctness: clampScore(Math.min(rawScores.correctness ?? 0, 0.8)),
          completeness: clampScore(Math.min(rawScores.completeness ?? 0, 0.8)),
          clarity: clampScore(Math.min(rawScores.clarity ?? 0, 1.5)),
          tradeoffs: clampScore(Math.min(rawScores.tradeoffs ?? 0, 0.5)),
          communication: clampScore(Math.min(rawScores.communication ?? 0, 1.8)),
        }
      : {
          correctness: clampScore(Math.min(rawScores.correctness ?? rating, maxCategoryScore)),
          completeness: clampScore(Math.min(rawScores.completeness ?? rating, maxCategoryScore)),
          clarity: clampScore(Math.min(rawScores.clarity ?? rating, Math.max(maxCategoryScore, 2.5))),
          tradeoffs: clampScore(Math.min(rawScores.tradeoffs ?? rating, maxCategoryScore)),
          communication: clampScore(Math.min(rawScores.communication ?? rating, Math.max(maxCategoryScore, 2.5))),
        };

  return {
    ...feedback,
    rating,
    feedback: lowSignalFeedback || feedback.feedback,
    scores,
    strengths: assessment.maxRating <= 1.4 ? [] : feedback.strengths || [],
    coachingTips:
      assessment.maxRating <= 2
        ? [
            "Start with a direct answer to the exact question.",
            "Name the core concept or algorithm before adding details.",
            "Add edge cases, complexity, tradeoffs, or a concrete example.",
          ]
        : feedback.coachingTips || [],
    idealAnswer: feedback.idealAnswer || correctAns,
    riskFlags: [...new Set([...(feedback.riskFlags || []), ...assessment.riskFlags])],
    communicationMetrics,
    qualitySignals: {
      relevance: assessment.relevance,
      matchedConcepts: assessment.matchedTerms.slice(0, 8),
      maxRatingApplied: assessment.maxRating < 5 ? assessment.maxRating : null,
    },
  };
}

function evaluateLocally({ interview, question, correctAns, userAnswer, communicationMetrics, error }) {
  const assessment = assessAnswerQuality({ question, correctAns, userAnswer, communicationMetrics });
  const referenceTerms = new Set(wordsFromText(`${question} ${correctAns}`).slice(0, 40));
  const answerTerms = new Set(wordsFromText(userAnswer));
  const matchedTerms = [...referenceTerms].filter((term) => answerTerms.has(term));
  const coverage = referenceTerms.size ? matchedTerms.length / referenceTerms.size : 0;
  const wordCount = communicationMetrics.wordCount;
  const structureSignals = communicationMetrics.structureSignals;

  const correctness = clampScore(coverage * 5);
  const completeness = clampScore(Math.min(5, wordCount / 22 + (structureSignals.mentionsExample ? 0.8 : 0)));
  const clarity = clampScore(
    Math.max(0.5, 3.4 - communicationMetrics.fillerWordRate / 12 - Math.max(0, communicationMetrics.avgSentenceLength - 28) / 18)
  );
  const tradeoffs = clampScore(structureSignals.mentionsTradeoffs ? 3.8 : coverage > 0.2 ? 1.8 : 0.5);
  const communication = clampScore(Math.max(0.8, clarity + (structureSignals.hasConclusion ? 0.3 : 0)));
  const rating = clampScore(
    correctness * 0.42 + completeness * 0.24 + clarity * 0.14 + tradeoffs * 0.12 + communication * 0.08
  );

  const data = applyScoringGuardrails(
    {
    rating,
    feedback:
      rating >= 4
        ? "Strong answer. You covered the core idea with enough structure and detail. To make it interview-ready, add one concrete metric or production example and call out the main tradeoff explicitly."
        : rating >= 3
          ? "Solid start, but the answer needs sharper structure and more specifics. Use a short setup, explain the decision path, add one example, and close with tradeoffs or validation."
          : "The answer is too thin for a strong interview signal. Rebuild it with a STAR or problem-solution-tradeoff structure, include concrete details, and connect it back to the question.",
    scores: {
      correctness: Number(correctness.toFixed(1)),
      completeness: Number(completeness.toFixed(1)),
      clarity: Number(clarity.toFixed(1)),
      tradeoffs: Number(tradeoffs.toFixed(1)),
      communication: Number(communication.toFixed(1)),
    },
    strengths: matchedTerms.slice(0, 3).length
      ? [`Covered relevant concepts: ${matchedTerms.slice(0, 3).join(", ")}`]
      : ["Attempted to answer the prompt directly"],
    coachingTips: [
      "Open with a one-sentence thesis before details.",
      "Add one project or production example with measurable impact.",
      "End with a tradeoff, risk, or validation step.",
    ],
    idealAnswer: correctAns,
    followUpQuestion: "Can you give a concrete example from a project where you applied this?",
    riskFlags: rating < 3 ? ["Low detail", "Missing examples or tradeoffs"] : [],
    communicationMetrics,
    },
    assessment,
    correctAns,
    communicationMetrics
  );

  return createLocalResult({
    data,
    fallbackReason: error?.message || "Gemini is not configured",
  });
}

export async function evaluateAnswer({ interview, question, correctAns, userAnswer }) {
  const communicationMetrics = analyzeCommunication(userAnswer);
  const assessment = assessAnswerQuality({ question, correctAns, userAnswer, communicationMetrics });
  const prompt = `
You are a strict but helpful interview evaluator.

Evaluate the candidate answer against the question and reference answer. Use a 0-5 rating.
Output valid JSON only.

Scoring calibration:
- 0.0-1.0: refusal, "I don't know", placeholder, nonsense, or no meaningful answer.
- 1.0-2.0: very thin, mostly off-topic, or repeats the question without solving it.
- 2.0-3.0: partial answer with some relevant concepts but major missing reasoning or correctness.
- 3.0-4.0: solid answer with correct approach and some depth, but missing edge cases/tradeoffs/examples.
- 4.0-5.0: strong interview-ready answer with correctness, depth, structure, tradeoffs, and examples.
Do not give a polite midpoint score to a trash answer. If the candidate says they do not know, rating must be 1.0 or lower.

JSON shape:
{
  "rating": 3.8,
  "feedback": "3-5 sentence actionable feedback",
  "scores": {
    "correctness": 3.5,
    "completeness": 3,
    "clarity": 4,
    "tradeoffs": 2.5,
    "communication": 4
  },
  "strengths": ["specific strength"],
  "coachingTips": ["specific improvement"],
  "idealAnswer": "better answer in 4-6 sentences",
  "followUpQuestion": "one realistic follow-up question",
  "riskFlags": ["missing concept or concern"]
}

Interview:
- Role: ${interview.jobPosition}
- Stack: ${interview.techStacks}
- Type: ${interview.interviewType || "technical"}
- Difficulty: ${interview.difficulty || "mid"}

Question:
${question}

Reference answer:
${correctAns}

Candidate answer:
${userAnswer}

Local communication metrics:
${JSON.stringify(communicationMetrics)}

Server-side quality signals:
${JSON.stringify({
  relevance: assessment.relevance,
  lowEffort: assessment.lowEffort,
  refusal: assessment.refusal,
  riskFlags: assessment.riskFlags,
})}
`;

  let response;

  try {
    response = await generateJson({ prompt, schema: feedbackSchema });
  } catch (error) {
    response = evaluateLocally({ interview, question, correctAns, userAnswer, communicationMetrics, error });
  }

  return {
    ...response,
    data: {
      ...applyScoringGuardrails(response.data, assessment, correctAns, communicationMetrics),
    },
  };
}

export function buildInterviewReport({ interview, answers }) {
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
      for (const key of Object.keys(acc)) {
        if (Number.isFinite(Number(scores[key]))) {
          acc[key].push(Number(scores[key]));
        }
      }
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

  const tips = answers.flatMap((answer) => answer.coachingTips || []).slice(0, 8);
  const weakAreas = Object.entries(categoryScores)
    .filter(([, score]) => score > 0 && score < 3.5)
    .map(([area]) => area);

  return {
    interviewId: interview.mockId,
    role: interview.jobPosition,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    answeredQuestions: answers.length,
    totalQuestions: safeQuestionCount(interview),
    averageRating,
    categoryScores,
    weakAreas,
    topCoachingTips: tips,
    readiness:
      averageRating >= 4
        ? "Strong"
        : averageRating >= 3
          ? "Promising, needs targeted practice"
          : "Needs more practice before high-stakes interviews",
  };
}

export async function generatePracticePlan({ interview, answers, report }) {
  const answerSummary = answers
    .map((answer, index) => {
      const rating = answer.normalizedRating ?? answer.rating ?? "N/A";
      return `${index + 1}. Q: ${answer.question}\nRating: ${rating}\nFeedback: ${answer.feedback}`;
    })
    .join("\n\n");

  const prompt = `
Create a focused interview practice plan from this mock interview.
Output valid JSON only.

JSON shape:
{
  "summary": "short plan summary",
  "focusAreas": ["area"],
  "drills": [
    {
      "title": "drill name",
      "description": "what to do",
      "targetSkill": "skill",
      "estimatedMinutes": 30
    }
  ],
  "resources": ["resource or topic to study"]
}

Role: ${interview.jobPosition}
Stack: ${interview.techStacks}
Report: ${JSON.stringify(report)}
Answers:
${answerSummary}
`;

  try {
    return await generateJson({ prompt, schema: practicePlanSchema });
  } catch (error) {
    const weakAreas = report.weakAreas?.length ? report.weakAreas : ["clarity", "completeness", "tradeoffs"];
    const data = {
      summary: `Focus the next practice block on ${weakAreas.slice(0, 3).join(", ")} for ${interview.jobPosition}.`,
      focusAreas: weakAreas,
      drills: weakAreas.slice(0, 4).map((area) => ({
        title: `${area[0].toUpperCase()}${area.slice(1)} drill`,
        description: `Record a 2-minute answer, review it against the rubric, then rewrite it with one specific example and one tradeoff.`,
        targetSkill: area,
        estimatedMinutes: 25,
      })),
      resources: [
        `Review fundamentals for ${interview.techStacks || "the selected stack"}`,
        "Practice STAR answers with measurable impact",
        "Run one timed mock interview and compare before/after scores",
      ],
    };

    return createLocalResult({
      data,
      fallbackReason: error?.message || "Gemini is not configured",
    });
  }
}

function safeQuestionCount(interview) {
  try {
    const parsed = JSON.parse(interview.jsonMockResp || "{}");
    return (
      parsed.interviewQuestions?.length || parsed.interview_questions?.length || interview.questionCount || 0
    );
  } catch {
    return interview.questionCount || 0;
  }
}

export function extractSkills(text) {
  return listFromText(text).slice(0, 30);
}
