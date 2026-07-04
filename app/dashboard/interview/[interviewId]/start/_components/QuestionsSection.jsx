"use client";

import { CheckCircle2, Lightbulb, ListChecks, Volume2 } from "lucide-react";
import React, { useState } from "react";

function QuestionsSection({ mockInterviewQues, activeQuestionIndex, onQuestionChange }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeQuestion = mockInterviewQues?.[activeQuestionIndex];
  const questionCount = mockInterviewQues?.length || 0;
  const progress = questionCount ? Math.round(((activeQuestionIndex + 1) / questionCount) * 100) : 0;

  const textToSpeech = (text) => {
    if (!text) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.onstart = () => setIsSpeaking(true);
      msg.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(msg);
      return;
    }

    alert("Your browser does not support text-to-speech");
  };

  if (!mockInterviewQues?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
        No questions found for this interview.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Active prompt</p>
          <h2 className="mt-1 text-lg font-bold text-white">
            Question {activeQuestionIndex + 1} of {questionCount}
          </h2>
        </div>
        <div className="min-w-36">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Round progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {mockInterviewQues.map((question, index) => (
          <button
            type="button"
            key={question.id || index}
            onClick={() => onQuestionChange?.(index)}
            className={`flex items-center justify-center gap-2 rounded-lg p-2 text-center text-sm transition-all ${
              activeQuestionIndex === index
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {index < activeQuestionIndex && <CheckCircle2 size={14} />}
            Q{index + 1}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
              {activeQuestion?.category || "interview"} · {activeQuestion?.difficulty || "adaptive"}
            </p>
            <h2 className="text-xl font-bold leading-relaxed text-white">
              Q. {activeQuestion?.ques}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full bg-white/10 p-2 transition-all hover:bg-white/20"
            onClick={() => textToSpeech(activeQuestion?.ques)}
          >
            <Volume2 className={isSpeaking ? "animate-pulse text-blue-400" : "text-blue-400"} />
          </button>
        </div>

        {activeQuestion?.rubric?.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-200">
              <ListChecks size={16} className="text-cyan-300" />
              What this tests
            </div>
            <div className="space-y-2">
              {activeQuestion.rubric.map((item, index) => (
                <div
                  key={`${item.criterion}-${index}`}
                  className="flex justify-between gap-4 text-sm text-gray-300"
                >
                  <span>{item.criterion}</span>
                  <span className="text-cyan-300">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
        <div className="mb-3 flex items-center gap-3">
          <Lightbulb className="text-yellow-400" />
          <h2 className="text-lg font-bold text-yellow-300">Interview Tip</h2>
        </div>
        <p className="text-sm text-yellow-100">
          Use a structured answer: situation, decision, tradeoffs, result. Add one concrete project example
          when possible.
        </p>
      </div>
    </div>
  );
}

export default QuestionsSection;
