import { Activity, Bot, FileSearch, Gauge, Mic2, ShieldCheck } from "lucide-react";

const capabilities = [
  {
    title: "Server-side LLM orchestration",
    icon: ShieldCheck,
    status: "Implemented",
    detail: "Gemini and Neon credentials stay on the server behind authenticated API routes.",
  },
  {
    title: "Rubric evaluator",
    icon: Gauge,
    status: "Implemented",
    detail: "Answers are scored across correctness, completeness, clarity, tradeoffs, and communication.",
  },
  {
    title: "Candidate context grounding",
    icon: FileSearch,
    status: "Implemented",
    detail: "Resume, skills, selected mode, and target roles guide question generation.",
  },
  {
    title: "AI traces",
    icon: Activity,
    status: "Implemented",
    detail: "Generation and evaluation events store model, prompt version, latency, and payload metadata.",
  },
  {
    title: "Real-time interviewer",
    icon: Mic2,
    status: "Foundation ready",
    detail: "Current flow records browser speech; a Realtime/WebRTC interviewer can plug into the same APIs.",
  },
  {
    title: "Multi-agent coaching",
    icon: Bot,
    status: "Foundation ready",
    detail:
      "Planner, interviewer, evaluator, and coach responsibilities are separated in the server AI layer.",
  },
];

function AiLabPage() {
  return (
    <div className="min-h-screen px-4 pb-12 pt-32 text-white md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
            AI Lab
          </h1>
          <p className="mt-2 max-w-3xl text-gray-300">
            The app is now structured as an AI engineering project: secure orchestration, traceability,
            grounded generation, rubric scoring, and coaching workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <div key={capability.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <capability.icon className="mb-4 text-cyan-300" size={30} />
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-100">{capability.title}</h2>
                <span className="rounded-md bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">
                  {capability.status}
                </span>
              </div>
              <p className="text-sm text-gray-300">{capability.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AiLabPage;
