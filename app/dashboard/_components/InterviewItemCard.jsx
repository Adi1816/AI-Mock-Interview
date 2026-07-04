"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, BarChart3, FileText, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { deleteLocalInterview, isLocalInterviewId } from "@/utils/client/localInterviews";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function InterviewItemCard({ interview, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (interview.local || isLocalInterviewId(interview.mockId)) {
        deleteLocalInterview(interview.mockId, user?.id);
        toast.success("Local interview deleted");
        onDelete?.(interview.mockId);
        setIsDialogOpen(false);
        return;
      }

      const response = await fetch(`/api/interviews/${interview.mockId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete interview");
      }

      toast.success("Interview deleted");
      onDelete?.(interview.mockId);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/10">
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
              {interview.jobPosition}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
              {interview.interviewType || "technical"} - {interview.difficulty || "mid"}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs text-gray-300">
            {interview.jobExperience} yrs
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="text-gray-500">Stack:</span> {interview.techStacks || "Not specified"}
          </p>
          <p>
            <span className="text-gray-500">Created:</span> {interview.createdAt}
          </p>
          {interview.overallRating && (
            <p className="flex items-center gap-2 text-cyan-300">
              <BarChart3 size={16} />
              {Number(interview.overallRating).toFixed(1)}/5 overall
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-3">
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <Link href={`/dashboard/interview/${interview.mockId}/feedback`}>
            <FileText size={14} />
            Feedback
          </Link>
        </Button>
        <Button
          asChild
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
        >
          <Link href={`/dashboard/interview/${interview.mockId}`}>
            <Play size={14} />
            Start
          </Link>
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="bg-red-500/20 px-3 text-red-300 hover:bg-red-500/40"
            >
              <Trash2 size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-slate-900 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={22} />
                Delete Interview
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                This permanently removes the interview, answers, traces, and practice plans for this session.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500/20 text-red-300 hover:bg-red-500/40"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default InterviewItemCard;
