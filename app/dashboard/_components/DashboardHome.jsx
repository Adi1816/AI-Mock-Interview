"use client";

import AddNewInterview from "./AddNewInterview";
import InterviewList from "./InterviewList";
import { Button } from "@/components/ui/button";
import { getPresetByType } from "@/utils/client/interviewPresets";
import { readLocalProfile } from "@/utils/client/localProfile";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const defaultProfile = {
  targetRoles: "",
  skills: "",
  resumeText: "",
  careerGoals: "",
};

function firstItem(text, fallback) {
  return (
    String(text || "")
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter(Boolean)[0] || fallback
  );
}

function makePreset(type, overrides = {}) {
  const base = getPresetByType(type) || getPresetByType("technical");
  return {
    ...base,
    ...overrides,
    type: base.type,
    icon: base.icon,
  };
}

function suggestedPackages(profile) {
  const skills = profile.skills || "";
  const lowerSkills = skills.toLowerCase();
  const primaryRole = firstItem(profile.targetRoles, "Software Engineer");
  const stack = skills || "Core CS, projects, APIs, databases, communication";
  const suggestions = [];

  if (/react|next|javascript|typescript|frontend|ui|css|browser/.test(lowerSkills)) {
    suggestions.push(
      makePreset("frontend", {
        title: "Frontend Role Fit",
        jobTitle: primaryRole.includes("Frontend") ? primaryRole : "Frontend Engineer",
        techStacks: stack,
        description: "React patterns, browser behavior, accessibility, performance, and debugging.",
      })
    );
  }

  if (/node|express|api|postgres|sql|database|backend|server|redis|queue/.test(lowerSkills)) {
    suggestions.push(
      makePreset("backend", {
        title: "Backend Role Fit",
        jobTitle: primaryRole.includes("Backend") ? primaryRole : "Backend Engineer",
        techStacks: stack,
        description: "APIs, persistence, concurrency, auth, reliability, and observability.",
      })
    );
  }

  if (/dsa|algorithm|leetcode|array|graph|dynamic programming|recursion|tree/.test(lowerSkills)) {
    suggestions.push(
      makePreset("dsa", {
        title: "DSA Focus Pack",
        jobTitle: `${primaryRole} DSA Round`,
        techStacks: stack,
        description: "Coding problems, patterns, edge cases, dry runs, and complexity analysis.",
      })
    );
  }

  if (/system|design|scale|distributed|microservice|architecture/.test(lowerSkills) || suggestions.length < 2) {
    suggestions.push(
      makePreset("system-design", {
        title: "System Design Pack",
        jobTitle: `${primaryRole} System Design Round`,
        techStacks: stack,
        description: "Requirements, APIs, data models, scaling, reliability, and tradeoffs.",
      })
    );
  }

  suggestions.push(
    makePreset("behavioral", {
      title: "Behavioral Story Pack",
      jobTitle: `${primaryRole} Behavioral Round`,
      techStacks: "Ownership, collaboration, ambiguity, conflict, impact storytelling",
      description: "STAR stories, leadership, conflict handling, communication, and impact.",
    })
  );

  const unique = [];
  const seen = new Set();

  for (const suggestion of suggestions) {
    if (!seen.has(suggestion.type)) {
      unique.push(suggestion);
      seen.add(suggestion.type);
    }
  }

  return unique.slice(0, 4);
}

function DashboardHome() {
  const [profile, setProfile] = useState(defaultProfile);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (response.ok && payload.profile) {
          setProfile({
            ...defaultProfile,
            ...payload.profile,
          });
          setCloudSync(true);
          return;
        }

        if (response.ok && payload.databaseConfigured === false) {
          setProfile({
            ...defaultProfile,
            ...(readLocalProfile(user?.id) || {}),
          });
          setCloudSync(false);
          return;
        }
      } catch {
        setProfile({
          ...defaultProfile,
          ...(readLocalProfile(user?.id) || {}),
        });
        setCloudSync(false);
      } finally {
        setProfileLoaded(true);
      }
    }

    if (isLoaded) {
      loadProfile();
    }
  }, [isLoaded, user?.id]);

  const packages = useMemo(() => suggestedPackages(profile), [profile]);
  const hasProfile = Boolean(profile.skills || profile.resumeText || profile.targetRoles);
  const profileChecklist = [
    ["Target role", Boolean(profile.targetRoles)],
    ["Skill stack", Boolean(profile.skills)],
    ["Resume context", Boolean(profile.resumeText)],
    ["Career goals", Boolean(profile.careerGoals)],
  ];
  const completedProfileItems = profileChecklist.filter(([, done]) => done).length;
  const profileCompletion = Math.round((completedProfileItems / profileChecklist.length) * 100);
  const nextAction = hasProfile
    ? {
        title: "Start a suggested package",
        detail: "Your profile context is ready. Pick one package below for a focused interview round.",
        label: "View Suggested Packages",
        href: "#suggested-packages",
      }
    : {
        title: "Complete your interview profile",
        detail: "Add target roles and skills once. Suggested packs become much sharper after that.",
        label: "Complete Profile",
        href: "/dashboard/profile",
      };

  return (
    <div className="px-4 pb-12 pt-32 sm:px-6 md:pt-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles size={14} />
              AI interview workspace
            </div>
            <h1 className="max-w-3xl bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Prepare for the exact interview loop you are targeting.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Build a custom round, start from profile-based packages, and review previous interview reports from
              one focused workspace.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="w-fit bg-white text-slate-950 hover:bg-cyan-100"
              >
                <Link href="/dashboard/profile">
                  <FileText size={17} />
                  {hasProfile ? "Update Profile" : "Complete Profile"}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-fit border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/dashboard/questions">
                  Explore Topics
                  <ArrowRight size={17} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <NextActionCard action={nextAction} />
            <ProfileReadinessCard
              checklist={profileChecklist}
              completion={profileLoaded ? profileCompletion : 0}
              cloudSync={cloudSync}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard
            icon={Target}
            label="Profile context"
            value={profileLoaded && hasProfile ? "Ready" : "Needs setup"}
            detail={hasProfile ? firstItem(profile.targetRoles, "Role context loaded") : "Add skills and resume once"}
          />
          <SignalCard
            icon={Gauge}
            label="Scoring"
            value="Calibrated"
            detail="Strict low-effort detection and rubric scoring"
          />
          <SignalCard
            icon={Brain}
            label="Question engine"
            value="Adaptive"
            detail={cloudSync ? "Cloud-synced with Neon" : "Local demo mode"}
          />
        </section>

        <section id="suggested-packages" className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div>
            <SectionLabel icon={ClipboardList} title="Create New Interview" />
            <p className="mb-4 text-sm text-slate-400">
              Use this for a fully custom round. Resume upload is optional.
            </p>
            <AddNewInterview />
          </div>

          <div>
            <SectionLabel icon={Sparkles} title="Suggested Interview Packages" />
            <p className="mb-4 text-sm text-slate-400">
              Generated from your saved skills, target roles, and resume context when available.
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {packages.map((preset) => (
                <AddNewInterview key={preset.title} preset={preset} compact />
              ))}
            </div>
          </div>
        </section>

        <section>
          <InterviewList />
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, title }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
        <Icon size={19} />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
  );
}

function SignalCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-cyan-200">
          <Icon size={18} />
        </div>
        <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-300">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function NextActionCard({ action }) {
  return (
    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-lg shadow-cyan-950/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-cyan-300/15 p-2 text-cyan-100">
          <Layers3 size={18} />
        </div>
        <p className="text-sm font-semibold text-cyan-100">Next recommended action</p>
      </div>
      <h2 className="text-xl font-bold text-white">{action.title}</h2>
      <p className="mt-2 text-sm leading-6 text-cyan-50/80">{action.detail}</p>
      <Button
        asChild
        className="mt-5 w-full bg-white text-slate-950 hover:bg-cyan-100"
      >
        <Link href={action.href}>
          {action.label}
          <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  );
}

function ProfileReadinessCard({ checklist, completion, cloudSync }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Profile readiness</p>
          <p className="mt-1 text-xs text-slate-400">{cloudSync ? "Saved per Clerk user" : "Local demo mode"}</p>
        </div>
        <span className="text-xl font-bold text-cyan-200">{completion}%</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
          style={{ width: `${completion}%` }}
        />
      </div>
      <div className="space-y-2">
        {checklist.map(([label, done]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className={done ? "text-slate-200" : "text-slate-500"}>{label}</span>
            <CheckCircle2 size={16} className={done ? "text-cyan-300" : "text-slate-600"} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardHome;
