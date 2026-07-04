import { Brain, Code2, Database, MessageSquare, Network, PanelsTopLeft, UsersRound } from "lucide-react";

export const interviewPresets = [
  {
    title: "Technical",
    type: "technical",
    icon: Code2,
    techStacks: "Core CS, selected role stack, debugging, APIs, databases",
    jobTitle: "Technical Interview",
    jobDescription:
      "Ask role-relevant technical questions that test fundamentals, implementation decisions, debugging, and project tradeoffs.",
    description: "Concept depth, implementation choices, debugging, and real project tradeoffs.",
  },
  {
    title: "System Design",
    type: "system-design",
    icon: Network,
    techStacks: "APIs, databases, caching, queues, load balancing, observability",
    jobTitle: "System Design Interview",
    jobDescription:
      "Run a system design interview focused on requirements, API design, data modeling, scalability, reliability, tradeoffs, and observability.",
    description: "Scalability, APIs, data modeling, caching, queues, reliability, and observability.",
  },
  {
    title: "DSA",
    type: "dsa",
    icon: Brain,
    techStacks: "Arrays, strings, graphs, dynamic programming, recursion, complexity analysis",
    jobTitle: "DSA Interview",
    jobDescription:
      "Ask algorithmic questions with emphasis on problem decomposition, edge cases, complexity, pattern recognition, and dry-run explanation.",
    description: "Problem decomposition, complexity, edge cases, pattern recognition, and dry runs.",
  },
  {
    title: "Frontend",
    type: "frontend",
    icon: PanelsTopLeft,
    techStacks: "React, Next.js, JavaScript, browser APIs, accessibility, performance, state management",
    jobTitle: "Frontend Interview",
    jobDescription:
      "Assess frontend engineering depth across UI architecture, React patterns, browser behavior, accessibility, performance, and debugging.",
    description: "UI architecture, React, browser behavior, accessibility, and performance.",
  },
  {
    title: "Backend",
    type: "backend",
    icon: Database,
    techStacks: "Node.js, APIs, PostgreSQL, transactions, auth, queues, caching",
    jobTitle: "Backend Interview",
    jobDescription:
      "Assess backend design and implementation across APIs, persistence, transactions, concurrency, security, distributed systems, and observability.",
    description: "Persistence, transactions, concurrency, security, distributed systems, and APIs.",
  },
  {
    title: "Behavioral",
    type: "behavioral",
    icon: UsersRound,
    techStacks: "Leadership, ownership, conflict resolution, ambiguity, teamwork, communication",
    jobTitle: "Behavioral Interview",
    jobDescription:
      "Ask behavioral questions that evaluate ownership, conflict handling, ambiguity, leadership, learning, collaboration, and measurable impact.",
    description: "Ownership, conflict, ambiguity, leadership, learning, and impact storytelling.",
  },
  {
    title: "HR",
    type: "hr",
    icon: MessageSquare,
    techStacks: "Motivation, role alignment, communication, culture fit, salary framing",
    jobTitle: "HR Interview",
    jobDescription:
      "Run an HR-style screen focused on motivation, communication, culture fit, role alignment, work preferences, and negotiation framing.",
    description: "Motivation, communication, culture fit, salary framing, and role alignment.",
  },
];

export function getPresetByType(type) {
  return interviewPresets.find((preset) => preset.type === type);
}
