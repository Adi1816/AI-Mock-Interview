"use client";

import ResumeUpload from "@/components/interview/ResumeUpload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { saveLocalInterview } from "@/utils/client/localInterviews";
import { readLocalProfile } from "@/utils/client/localProfile";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, CheckCircle2, ChevronDown, LoaderCircle, PlusCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const baseForm = {
  jobTitle: "",
  techStacks: "",
  duration: "1",
  interviewType: "technical",
  difficulty: "mid",
  targetCompany: "",
  resumeText: "",
  questionCount: 8,
};

function buildInitialForm(preset) {
  return {
    ...baseForm,
    jobTitle: preset?.jobTitle || "",
    jobDescription: preset?.jobDescription || "",
    techStacks: preset?.techStacks || "",
    interviewType: preset?.type || "technical",
    difficulty: preset?.difficulty || "mid",
    questionCount: preset?.questionCount || 8,
  };
}

function errorFromPayload(payload, fallback) {
  const fieldErrors = payload?.details?.fieldErrors || {};
  const firstFieldError = Object.entries(fieldErrors)
    .flatMap(([field, messages]) => (messages || []).map((message) => `${field}: ${message}`))
    .at(0);

  return firstFieldError || payload?.error || fallback;
}

function AddNewInterview({ onCreated, preset, compact = false, triggerLabel, triggerDescription }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(() => buildInitialForm(preset));
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const TriggerIcon = preset?.icon || PlusCircle;
  const isPresetFlow = Boolean(preset);

  const dialogTitle = useMemo(() => {
    if (preset) {
      return `${preset.title} Interview`;
    }

    return "Design Your AI Interview";
  }, [preset]);

  useEffect(() => {
    async function loadProfileContext() {
      if (!openDialog || profileLoaded) {
        return;
      }

      let profile = null;

      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (response.ok && payload.profile) {
          profile = payload.profile;
        } else if (response.ok && payload.databaseConfigured === false) {
          profile = readLocalProfile(user?.id);
        }
      } catch {
        profile = readLocalProfile(user?.id);
      }

      if (profile) {
        setForm((current) => ({
          ...current,
          techStacks: current.techStacks || profile.skills || "",
          resumeText: current.resumeText || profile.resumeText || "",
        }));
        setResumeFileName((current) => current || profile.resumeFileName || "");
      }

      setProfileLoaded(true);
    }

    if (isLoaded) {
      loadProfileContext();
    }
  }, [isLoaded, openDialog, profileLoaded, user?.id]);

  const openCreateDialog = () => {
    setForm(buildInitialForm(preset));
    setResumeFileName("");
    setProfileLoaded(false);
    setOpenDialog(true);
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(errorFromPayload(payload, "Failed to create interview"));
      }

      const interview = payload.demo ? saveLocalInterview(payload.interview, user?.id) : payload.interview;

      toast.success(payload.demo ? "Interview generated in local demo mode" : "AI interview generated");
      setOpenDialog(false);
      setForm(buildInitialForm(preset));
      setResumeFileName("");
      onCreated?.(interview);
      router.push(`/dashboard/interview/${interview.mockId}`);
    } catch (error) {
      const message = error.message?.includes("DATABASE_URL")
        ? "Connect DATABASE_URL in .env.local before generating saved interviews."
        : error.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className={
          isPresetFlow
            ? "group flex h-full w-full cursor-pointer flex-col rounded-xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-400/10"
            : "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:border-blue-500/50 hover:bg-white/10"
        }
        onClick={openCreateDialog}
      >
        <TriggerIcon
          className={isPresetFlow ? "mb-4 text-cyan-300" : "mb-4 text-blue-400"}
          size={isPresetFlow ? 30 : 40}
        />
        <span
          className={
            isPresetFlow
              ? "text-xl font-bold text-gray-100"
              : "bg-gradient-to-r from-cyan-200 to-blue-400 bg-clip-text text-center text-xl font-bold text-transparent"
          }
        >
          {triggerLabel || preset?.title || "Create AI Interview"}
        </span>
        <span className="mt-2 text-sm text-gray-300">
          {triggerDescription || preset?.description || "Role, resume, rubric, and difficulty aware"}
        </span>
        {isPresetFlow && (
          <span className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition group-hover:bg-cyan-400/20">
            Start interview on this topic
            <ArrowRight size={15} />
          </span>
        )}
      </button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-slate-900/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <Zap className="text-blue-400" size={28} />
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {compact
                ? "This segment is preconfigured. Choose experience and add a resume only if you want extra personalization."
                : "Generate a role-specific interview with rubric-based scoring and personalized context."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-5 pt-4">
            {isPresetFlow && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-cyan-200">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">{preset.title} mode selected</span>
                </div>
                <p className="text-sm text-gray-300">{preset.description}</p>
              </div>
            )}

            {!compact && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Job Title">
                    <Input
                      placeholder="Full Stack Developer"
                      required
                      value={form.jobTitle}
                      onChange={(event) => updateField("jobTitle", event.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </Field>

                  <Field label="Tech Stack">
                    <Input
                      placeholder="React, Node.js, PostgreSQL"
                      required
                      value={form.techStacks}
                      onChange={(event) => updateField("techStacks", event.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </Field>
                </div>

	                <Field label="Target Company">
                  <Input
                    placeholder="Optional"
                    value={form.targetCompany}
                    onChange={(event) => updateField("targetCompany", event.target.value)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                </Field>
              </>
            )}

            <div className={`grid grid-cols-1 gap-4 ${compact ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
              <Field label="Experience">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={form.duration}
                  onChange={(event) => updateField("duration", event.target.value)}
                  className="border-white/20 bg-white/10 text-white"
                />
              </Field>

              {!compact && (
                <SelectField
                  label="Mode"
                  value={form.interviewType}
                  onChange={(value) => updateField("interviewType", value)}
                  options={[
                    ["technical", "Technical"],
                    ["behavioral", "Behavioral"],
                    ["system-design", "System Design"],
                    ["dsa", "DSA"],
                    ["frontend", "Frontend"],
                    ["backend", "Backend"],
                    ["ml", "ML"],
                    ["hr", "HR"],
                  ]}
                />
              )}

              <SelectField
                label="Difficulty"
                value={form.difficulty}
                onChange={(value) => updateField("difficulty", value)}
                options={[
                  ["junior", "Junior"],
                  ["mid", "Mid"],
                  ["senior", "Senior"],
                  ["staff", "Staff"],
                ]}
              />

              <Field label="Questions">
                <Input
                  type="number"
                  min="3"
                  max="12"
                  value={form.questionCount}
                  onChange={(event) => updateField("questionCount", Number(event.target.value))}
                  className="border-white/20 bg-white/10 text-white"
                />
              </Field>
            </div>

            <Field label="Resume Upload (Optional)">
              <ResumeUpload
                value={form.resumeText}
                fileName={resumeFileName}
                onChange={({ text, fileName }) => {
                  updateField("resumeText", text);
                  setResumeFileName(fileName);
                }}
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-200">{label}</span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-white/20 bg-slate-950/90 px-4 py-2 pr-12 text-sm text-white outline-none transition hover:border-white/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
        >
          {options.map(([optionValue, labelText]) => (
            <option key={optionValue} value={optionValue}>
              {labelText}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </Field>
  );
}

export default AddNewInterview;
