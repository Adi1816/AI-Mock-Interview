"use client";

import { Button } from "@/components/ui/button";
import { isLocalInterviewId, saveLocalAnswer } from "@/utils/client/localInterviews";
import { useUser } from "@clerk/nextjs";
import { Camera, CameraOff, Check, Edit, Mic, Save, StopCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";

function RecordAnsSection({ mockInterviewQues, activeQuestionIndex, interviewData }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [editableAnswer, setEditableAnswer] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [answerSaved, setAnswerSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const recordingRef = useRef(false);
  const transcriptRef = useRef("");
  const webcamRef = useRef(null);
  const { user } = useUser();

  const currentQuestion = mockInterviewQues?.[activeQuestionIndex];
  const isLocalInterview = interviewData?.local || isLocalInterviewId(interviewData?.mockId);

  useEffect(() => {
    setUserAnswer("");
    setEditableAnswer("");
    setIsEditing(false);
    setAnswerSaved(false);
    transcriptRef.current = "";
  }, [activeQuestionIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || recognitionRef.current) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0].transcript} `;
      }
      transcriptRef.current = transcript.trim();
      setUserAnswer(transcriptRef.current);
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (recordingRef.current) {
        try {
          recognition.start();
        } catch {
          recordingRef.current = false;
          setIsRecording(false);
        }
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleWebcam = () => {
    if (webcamRef.current?.stream && webcamEnabled) {
      webcamRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    setWebcamEnabled((enabled) => !enabled);
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not available");
      return;
    }

    try {
      await navigator.mediaDevices?.getUserMedia?.({ audio: true });
      transcriptRef.current = "";
      setUserAnswer("");
      setEditableAnswer("");
      setAnswerSaved(false);
      recognitionRef.current.start();
      recordingRef.current = true;
      setIsRecording(true);
      toast.success("Recording started");
    } catch {
      toast.error("Microphone access is required to record an answer");
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) {
      return;
    }

    recordingRef.current = false;
    recognitionRef.current.stop();
    setIsRecording(false);

    const finalTranscript = transcriptRef.current.trim();

    if (finalTranscript.length < 5) {
      toast.error("No speech detected or answer is too short");
      return;
    }

    setUserAnswer(finalTranscript);
    setEditableAnswer(finalTranscript);
    setIsEditing(true);
  };

  const submitAnswer = async (answerText) => {
    if (!currentQuestion) {
      toast.error("No active question found");
      return;
    }

    if (answerText.trim().length < 5) {
      toast.error("Answer is too short");
      return;
    }

    setLoading(true);

    try {
      const answerPayload = {
        questionId: currentQuestion.id,
        question: currentQuestion.ques,
        correctAns: currentQuestion.ans,
        userAnswer: answerText.trim(),
        activeQuestionIndex,
      };
      const response = await fetch(
        isLocalInterview ? "/api/demo/evaluate" : `/api/interviews/${interviewData.mockId}/answers`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify(
            isLocalInterview
              ? {
                  interview: interviewData,
                  answer: answerPayload,
                }
              : answerPayload
          ),
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save answer");
      }

      if (isLocalInterview) {
        saveLocalAnswer({
          mockId: interviewData.mockId,
          answerInput: answerPayload,
          feedback: payload.feedback,
          userId: user?.id,
        });
      }

      setUserAnswer(answerText.trim());
      setEditableAnswer(answerText.trim());
      setIsEditing(false);
      setAnswerSaved(true);
      toast.success("Answer saved. Full feedback unlocks at the end.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveEditedAnswer = () => {
    submitAnswer(editableAnswer);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Candidate camera</p>
            <p className="text-sm font-semibold text-white">{webcamEnabled ? "Video ready" : "Video paused"}</p>
          </div>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">
            {isRecording ? "Recording" : "Standby"}
          </span>
        </div>
        <div className="relative overflow-hidden rounded-lg">
          {webcamEnabled ? (
            <Webcam
              ref={webcamRef}
              mirrored
              className="h-[200px] w-full rounded-lg object-cover md:h-[230px] xl:h-[260px]"
            />
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg bg-gray-900 md:h-[230px] xl:h-[260px]">
              <CameraOff className="text-gray-500" size={64} />
            </div>
          )}

          <div className="absolute right-4 top-4 rounded-md bg-black/50">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleWebcam}
              className="text-white hover:bg-black/50 hover:text-white"
            >
              {webcamEnabled ? <CameraOff size={20} /> : <Camera size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {!userAnswer && (
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Response workspace</p>
              <h3 className="text-lg font-bold text-white">Draft your answer</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveEditedAnswer}
              disabled={loading || editableAnswer.trim().length < 5}
              className="border-green-500/40 bg-transparent text-green-300 hover:bg-green-500/10 hover:text-white"
            >
              <Save size={16} />
              Save Answer
            </Button>
          </div>
          <textarea
            value={editableAnswer}
            onChange={(event) => setEditableAnswer(event.target.value)}
            placeholder="Type your answer here if you do not want to use voice recording."
            className="min-h-[120px] w-full rounded-lg bg-white/10 p-3 text-gray-200 outline-none ring-blue-500 placeholder:text-gray-500 focus:ring-2"
          />
        </div>
      )}

      {userAnswer && (
        <div className="max-h-52 w-full overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Response workspace</p>
              <h3 className="text-xl font-bold text-white">Your Answer</h3>
            </div>
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={saveEditedAnswer}
                disabled={loading}
                className="border-green-500/40 bg-transparent text-green-300 hover:bg-green-500/10 hover:text-white"
              >
                <Check size={16} />
                Done
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditableAnswer(userAnswer);
                  setIsEditing(true);
                }}
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Edit size={16} />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editableAnswer}
              onChange={(event) => setEditableAnswer(event.target.value)}
              className="w-full rounded-lg bg-white/10 p-3 text-gray-200 outline-none ring-blue-500 focus:ring-2"
              rows={5}
            />
          ) : (
            <p className="whitespace-pre-wrap text-gray-300">{userAnswer}</p>
          )}
        </div>
      )}

      {answerSaved && (
        <div className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-cyan-200">Answer saved</p>
              <p className="mt-1 text-sm text-gray-200">Your score and coaching notes are reserved for the final feedback report.</p>
            </div>
            <Save size={18} className="shrink-0 text-cyan-300" />
          </div>
        </div>
      )}

      <Button
        type="button"
        disabled={loading || (!isRecording && !speechSupported)}
        className={`w-full py-6 ${
          isRecording
            ? "bg-red-500/20 text-red-300 hover:bg-red-500/40"
            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
        }`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <>
            <StopCircle className="animate-pulse" size={22} />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={22} />
            {loading ? "Saving..." : speechSupported ? "Record Answer" : "Voice Not Available"}
          </>
        )}
      </Button>
    </div>
  );
}

export default RecordAnsSection;
