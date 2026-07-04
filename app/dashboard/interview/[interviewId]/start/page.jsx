"use client";

import React, { useEffect, useMemo, useState } from "react";
import QuestionsSection from "./_components/QuestionsSection";
import RecordAnsSection from "./_components/RecordAnsSection";
import { Button } from "@/components/ui/button";
import { getLocalInterview, isLocalInterviewId } from "@/utils/client/localInterviews";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, StopCircle } from "lucide-react";
import { toast } from "sonner";

function formatElapsed(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function StartInterview() {
  const { interviewId } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function loadInterview() {
      try {
        if (isLocalInterviewId(interviewId)) {
          setInterviewData(getLocalInterview(interviewId, user?.id));
          return;
        }

        const response = await fetch(`/api/interviews/${interviewId}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load interview");
        }

        setInterviewData(payload.interview);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (interviewId && isLoaded) {
      loadInterview();
    }
  }, [interviewId, isLoaded, user?.id]);

  useEffect(() => {
    if (!interviewData) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [interviewData]);

  const mockInterviewQues = useMemo(() => interviewData?.questions || [], [interviewData]);
  const canGoNext = activeQuestionIndex < mockInterviewQues.length - 1;
  const canGoPrevious = activeQuestionIndex > 0;
  const progress = mockInterviewQues.length
    ? Math.round(((activeQuestionIndex + 1) / mockInterviewQues.length) * 100)
    : 0;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-32 md:px-6 md:pt-8">
        {loading ? (
          <div className="mt-20 rounded-xl border border-white/10 bg-white/5 p-8 text-gray-300">
            Loading interview...
          </div>
        ) : !interviewData ? (
          <div className="mt-20 rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-red-200">
            Interview not found or you do not have access.
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Interview Studio</p>
                  <h1 className="mt-1 text-2xl font-bold text-white">{interviewData.jobPosition}</h1>
                  <p className="mt-1 text-sm text-slate-400">
                    {interviewData.interviewType || "technical"} - {interviewData.difficulty || "mid"} -{" "}
                    {interviewData.techStacks}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                  <StudioMetric label="Question" value={`${activeQuestionIndex + 1}/${mockInterviewQues.length}`} />
                  <StudioMetric icon={Clock3} label="Elapsed" value={formatElapsed(elapsedSeconds)} />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)]">
              <div className="order-1 md:order-none">
                <QuestionsSection
                  mockInterviewQues={mockInterviewQues}
                  activeQuestionIndex={activeQuestionIndex}
                  onQuestionChange={setActiveQuestionIndex}
                />
              </div>

              <div className="order-2 md:order-none">
                <RecordAnsSection
                  mockInterviewQues={mockInterviewQues}
                  activeQuestionIndex={activeQuestionIndex}
                  interviewData={interviewData}
                />
              </div>

              <div className="xl:col-span-2">
                <div className="flex justify-end gap-3">
                  {canGoPrevious && (
                    <Button
                      type="button"
                      onClick={() => setActiveQuestionIndex((index) => index - 1)}
                      className="border border-white/20 bg-transparent text-white hover:bg-white/10"
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </Button>
                  )}

                  {canGoNext && (
                    <Button
                      type="button"
                      onClick={() => setActiveQuestionIndex((index) => index + 1)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  )}

                  <Button asChild className="bg-red-500/20 text-red-300 hover:bg-red-500/40">
                    <Link href={`/dashboard/interview/${interviewData.mockId}/feedback`}>
                      <StopCircle size={16} />
                      End Interview
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudioMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <p className="mt-1 text-lg font-bold text-cyan-100">{value}</p>
    </div>
  );
}

export default StartInterview;
