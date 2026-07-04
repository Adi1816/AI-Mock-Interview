"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  buildLocalPracticePlan,
  buildLocalReport,
  getLocalInterview,
  isLocalInterviewId,
  listLocalAnswers,
} from "@/utils/client/localInterviews";
import { useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardList,
  MessageSquareText,
  Radar,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const SCORE_KEYS = ["correctness", "completeness", "clarity", "tradeoffs", "communication"];

const SCORE_LABELS = {
  correctness: "Correctness",
  completeness: "Completeness",
  clarity: "Clarity",
  tradeoffs: "Tradeoffs",
  communication: "Communication",
};

const AREA_ACTIONS = {
  correctness: "Tighten fundamentals and verify each claim against the question.",
  completeness: "Cover the full ask: approach, implementation details, edge cases, and result.",
  clarity: "Use a crisp structure before adding details.",
  tradeoffs: "Call out alternatives and why your choice fits the constraint.",
  communication: "Slow down, signpost your answer, and keep examples measurable.",
};

function scoreEntries(report) {
  return SCORE_KEYS.map((key) => ({
    key,
    label: SCORE_LABELS[key],
    value: Number(report?.categoryScores?.[key] || 0),
  }));
}

function clampScore(score) {
  return Math.max(0, Math.min(5, Number(score) || 0));
}

function scoreTone(score) {
  if (score < 2) {
    return "text-red-300";
  }
  if (score < 3.5) {
    return "text-yellow-300";
  }
  return "text-cyan-300";
}

function scoreBarTone(score) {
  if (score < 2) {
    return "from-red-500 to-orange-400";
  }
  if (score < 3.5) {
    return "from-yellow-400 to-amber-500";
  }
  return "from-cyan-400 to-blue-500";
}

function getWeakAreas(report, entries) {
  const explicit = Array.isArray(report?.weakAreas) ? report.weakAreas : [];

  if (explicit.length > 0) {
    return explicit.slice(0, 4);
  }

  return [...entries]
    .filter((entry) => entry.value > 0)
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((entry) => entry.key);
}

function uniqueTips(tips) {
  return [...new Set((tips || []).map((tip) => String(tip || "").trim()).filter(Boolean))].slice(0, 6);
}

function Feedback() {
  const { interviewId } = useParams();
  const [feedbackList, setFeedbackList] = useState([]);
  const [report, setReport] = useState(null);
  const [practicePlan, setPracticePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function getFeedback() {
      try {
        if (isLocalInterviewId(interviewId)) {
          const interview = getLocalInterview(interviewId, user?.id);
          const answers = listLocalAnswers(interviewId, user?.id);
          setFeedbackList(answers);
          setReport(interview ? buildLocalReport({ interview, answers }) : null);
          return;
        }

        const response = await fetch(`/api/interviews/${interviewId}/feedback`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load feedback");
        }

        setFeedbackList(payload.feedbackList || []);
        setReport(payload.report || null);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (interviewId && isLoaded) {
      getFeedback();
    }
  }, [interviewId, isLoaded, user?.id]);

  const generatePlan = async () => {
    setPlanning(true);

    try {
      if (isLocalInterviewId(interviewId)) {
        const interview = getLocalInterview(interviewId, user?.id);
        const answers = listLocalAnswers(interviewId, user?.id);
        const localReport = report || (interview ? buildLocalReport({ interview, answers }) : null);

        if (!interview || !localReport || answers.length === 0) {
          throw new Error("Practice plan requires at least one answered question");
        }

        const plan = buildLocalPracticePlan({ interview, report: localReport });
        setPracticePlan(plan);
        toast.success("Practice plan generated");
        return;
      }

      const response = await fetch(`/api/interviews/${interviewId}/practice-plan`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to generate practice plan");
      }

      setPracticePlan(payload.generated);
      toast.success("Practice plan generated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPlanning(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-32 md:px-6 md:pt-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Radar size={14} />
              Final feedback report
            </p>
            <h1 className="max-w-3xl text-4xl font-bold text-white md:text-5xl">
              Your interview performance breakdown
            </h1>
            <p className="mt-3 max-w-2xl text-gray-300">
              Scores stay hidden during recording. This report unlocks the rubric, weak areas, and the next
              practice plan after the round ends.
            </p>
          </div>
          <Button
            asChild
            className="w-fit border border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/dashboard">
              <ArrowLeft size={18} />
              Dashboard
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-gray-300">
            Loading feedback...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-200">No answer feedback found</h2>
            <p className="mt-2 text-gray-400">Record and save at least one answer to generate a report.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {report && <ReportCard report={report} feedbackList={feedbackList} />}

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Next practice block</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Generate a targeted plan from your lowest rubric categories and answer-level feedback.
                </p>
              </div>
              <Button
                type="button"
                onClick={generatePlan}
                disabled={planning}
                className="w-fit bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              >
                <CalendarDays size={18} />
                {planning ? "Generating..." : "Generate Next Practice Plan"}
              </Button>
            </div>

            {practicePlan && <PracticePlan plan={practicePlan} />}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-cyan-200">
                  <MessageSquareText size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Coaching replay</h2>
                  <p className="text-sm text-slate-400">Open each answer to compare your response with the ideal direction.</p>
                </div>
              </div>
              {feedbackList.map((item, index) => (
                <Collapsible key={item.id || index}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Question {index + 1}</p>
                        <span className="mt-1 block text-gray-200">{item.question}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`hidden text-sm font-bold sm:inline ${scoreTone(Number(item.normalizedRating || item.rating || 0))}`}>
                          {Number(item.normalizedRating || item.rating || 0).toFixed(1)}/5
                        </span>
                      <ChevronsUpDown className="h-5 w-5 shrink-0 text-gray-500" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-4 rounded-b-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                      <ScoreBlock rating={item.normalizedRating || item.rating} scores={item.scores} />

                      <TextBlock title="Your Answer" value={item.userAnswer} tone="cyan" />
                      <TextBlock title="Improved Answer" value={item.correctAns} tone="green" />
                      <TextBlock title="Feedback" value={item.feedback} tone="yellow" />

                      {item.coachingTips?.length > 0 && (
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                          <h3 className="mb-2 font-bold text-blue-200">Coaching Tips</h3>
                          <ul className="space-y-2 text-sm text-gray-200">
                            {item.coachingTips.map((tip, tipIndex) => (
                              <li key={`${tip}-${tipIndex}`}>- {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ report, feedbackList }) {
  const entries = scoreEntries(report);
  const weakAreas = getWeakAreas(report, entries);
  const tips = uniqueTips(report.topCoachingTips);
  const averageRating = clampScore(report.averageRating);
  const answered = Number(report.answeredQuestions || feedbackList.length || 0);
  const total = Number(report.totalQuestions || answered || 0);
  const completion = total ? Math.round((answered / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Overall readiness</p>
            <h2 className="text-3xl font-bold text-white">{report.readiness}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              This score is calibrated from answer correctness, coverage, clarity, tradeoff thinking, and
              communication. Weak or low-effort answers are intentionally scored low.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-center">
            <p className="text-xs uppercase tracking-wide text-cyan-100/70">Final score</p>
            <p className={`mt-1 text-5xl font-bold ${scoreTone(averageRating)}`}>{averageRating.toFixed(1)}</p>
            <p className="mt-1 text-sm text-cyan-50/70">out of 5</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricTile icon={CheckCircle2} label="Answered" value={`${answered}/${total || answered}`} />
          <MetricTile icon={Target} label="Completion" value={`${completion}%`} />
          <MetricTile icon={BarChart3} label="Focus areas" value={weakAreas.length || "0"} />
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <ScoreBar key={entry.key} entry={entry} />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
              <Radar size={18} />
            </div>
            <div>
              <h2 className="font-bold text-white">Skill radar</h2>
              <p className="text-sm text-slate-400">A quick view of your scoring balance.</p>
            </div>
          </div>
          <RadarChart entries={entries} />
        </div>

        <WeakAreaPanel weakAreas={weakAreas} />

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles size={17} className="text-cyan-300" />
            Top coaching signals
          </div>
          {tips.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-300">
              {tips.map((tip, index) => (
                <li key={`${tip}-${index}`} className="rounded-lg bg-black/20 p-3">
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Save more answers to unlock stronger coaching signals.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function MetricTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ScoreBar({ entry }) {
  const width = `${(clampScore(entry.value) / 5) * 100}%`;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-200">{entry.label}</p>
        <p className={`text-sm font-bold ${scoreTone(entry.value)}`}>{clampScore(entry.value).toFixed(1)}/5</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${scoreBarTone(entry.value)}`} style={{ width }} />
      </div>
    </div>
  );
}

function RadarChart({ entries }) {
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const axisPoints = entries.map((entry, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / entries.length;
    const axisX = center + Math.cos(angle) * radius;
    const axisY = center + Math.sin(angle) * radius;
    const valueRadius = radius * (clampScore(entry.value) / 5);

    return {
      ...entry,
      axisX,
      axisY,
      valueX: center + Math.cos(angle) * valueRadius,
      valueY: center + Math.sin(angle) * valueRadius,
      labelX: center + Math.cos(angle) * (radius + 28),
      labelY: center + Math.sin(angle) * (radius + 28),
    };
  });
  const polygon = axisPoints.map((point) => `${point.valueX},${point.valueY}`).join(" ");

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-64 w-full max-w-72" role="img" aria-label="Skill radar chart">
        {[0.33, 0.66, 1].map((scale) => (
          <polygon
            key={scale}
            points={axisPoints
              .map((point) => {
                const x = center + (point.axisX - center) * scale;
                const y = center + (point.axisY - center) * scale;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        ))}
        {axisPoints.map((point) => (
          <line
            key={point.key}
            x1={center}
            y1={center}
            x2={point.axisX}
            y2={point.axisY}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
        ))}
        <polygon points={polygon} fill="rgba(34,211,238,0.28)" stroke="rgb(34,211,238)" strokeWidth="2" />
        {axisPoints.map((point) => (
          <g key={`${point.key}-label`}>
            <circle cx={point.valueX} cy={point.valueY} r="3.5" fill="rgb(103,232,249)" />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(226,232,240,0.85)"
              fontSize="9"
            >
              {point.label.split(" ")[0]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function WeakAreaPanel({ weakAreas }) {
  return (
    <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-yellow-100">
        <AlertTriangle size={17} />
        Weak areas to fix first
      </div>
      {weakAreas.length > 0 ? (
        <div className="space-y-3">
          {weakAreas.map((area) => (
            <div key={area} className="rounded-lg bg-black/20 p-3">
              <p className="text-sm font-bold capitalize text-yellow-100">{area}</p>
              <p className="mt-1 text-sm text-yellow-50/75">{AREA_ACTIONS[area] || "Practice this area deliberately."}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-yellow-50/80">No major weak area detected from the saved answers.</p>
      )}
    </div>
  );
}

function PracticePlan({ plan }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6 backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-300/15 p-2 text-cyan-100">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-100">Personal Practice Plan</h2>
            <p className="text-sm text-cyan-50/70">Your next focused block before another mock round.</p>
          </div>
        </div>
      </div>
      <p className="mb-5 rounded-xl bg-black/20 p-4 text-gray-200">{plan.summary}</p>

      {plan.focusAreas?.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {plan.focusAreas.map((area) => (
            <span key={area} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-50">
              {area}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {plan.drills?.map((drill, index) => (
          <div key={`${drill.title}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-cyan-200">
              <Sparkles size={16} />
              <h3 className="font-bold">{drill.title}</h3>
            </div>
            <p className="text-sm text-gray-300">{drill.description}</p>
            {drill.estimatedMinutes && (
              <p className="mt-3 text-xs uppercase tracking-wide text-cyan-100/60">{drill.estimatedMinutes} min drill</p>
            )}
          </div>
        ))}
      </div>

      {plan.resources?.length > 0 && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="mb-3 text-sm font-bold text-cyan-100">Study queue</p>
          <ul className="space-y-2 text-sm text-gray-300">
            {plan.resources.map((resource, index) => (
              <li key={`${resource}-${index}`}>{resource}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreBlock({ rating, scores }) {
  const normalizedRating = clampScore(rating);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-bold text-gray-300">Rating</span>
        <span className={`text-xl font-bold ${scoreTone(normalizedRating)}`}>{normalizedRating.toFixed(1)}/5</span>
      </div>
      {scores && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {scoreEntries({ categoryScores: scores }).map((entry) => (
            <div key={entry.key} className="rounded-md bg-white/5 p-2">
              <p className="text-xs text-gray-500">{entry.label}</p>
              <p className={`font-bold ${scoreTone(entry.value)}`}>{clampScore(entry.value).toFixed(1)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextBlock({ title, value, tone }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    green: "border-green-400/20 bg-green-400/10 text-green-200",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-200",
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.cyan}`}>
      <h3 className="mb-2 font-bold">{title}</h3>
      <p className="whitespace-pre-wrap text-gray-200">{value}</p>
    </div>
  );
}

export default Feedback;
