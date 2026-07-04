"use client";

import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { DatabaseZap, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listLocalInterviews } from "@/utils/client/localInterviews";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function InterviewList() {
  const [interviewList, setInterviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localMode, setLocalMode] = useState(false);
  const { user, isLoaded } = useUser();

  const getInterviewList = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);

    try {
      const localInterviews = listLocalInterviews(user?.id);
      const response = await fetch("/api/interviews", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load interviews");
      }

      const cloudInterviews = payload.interviews || [];
      setLocalMode(payload.databaseConfigured === false);
      setInterviewList([
        ...localInterviews,
        ...cloudInterviews.filter(
          (cloudInterview) => !localInterviews.some((localInterview) => localInterview.mockId === cloudInterview.mockId)
        ),
      ]);
    } catch (error) {
      const localInterviews = listLocalInterviews(user?.id);
      setInterviewList(localInterviews);
      setLocalMode(true);

      if (localInterviews.length === 0) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      getInterviewList();
    }
  }, [isLoaded, user?.id]);

  const handleDeleteInterview = (deletedMockId) => {
    setInterviewList((prevList) => prevList.filter((interview) => interview.mockId !== deletedMockId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Zap className="text-blue-400" size={30} />
          <h2 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-2xl font-bold text-transparent">
            Previous Mock Interviews
          </h2>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getInterviewList}
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      {localMode && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <DatabaseZap className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300" />
          <p>
            Local demo mode is active. Interviews and feedback work in this browser; add `DATABASE_URL` later for
            cloud sync across devices.
          </p>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
          Loading interviews...
        </div>
      ) : interviewList.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <h3 className="text-xl font-bold text-gray-200">No interviews yet</h3>
          <p className="mt-2 text-sm text-gray-400">
            Create one with a role, resume context, and difficulty.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {interviewList.map((interview) => (
            <InterviewItemCard
              key={interview.mockId}
              interview={interview}
              onDelete={handleDeleteInterview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewList;
