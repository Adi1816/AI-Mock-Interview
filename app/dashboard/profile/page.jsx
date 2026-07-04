"use client";

import ResumeUpload from "@/components/interview/ResumeUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { readLocalProfile, writeLocalProfile } from "@/utils/client/localProfile";
import { useUser } from "@clerk/nextjs";
import { Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const emptyProfile = {
  targetRoles: "",
  skills: "",
  resumeText: "",
  resumeFileName: "",
  careerGoals: "",
  preferences: {},
};

function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (response.ok && payload.databaseConfigured === false) {
          setCloudSync(false);
          setProfile({
            ...emptyProfile,
            ...(readLocalProfile(user?.id) || {}),
          });
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load profile");
        }

        if (payload.profile) {
          setProfile({
            targetRoles: payload.profile.targetRoles || "",
            skills: payload.profile.skills || "",
            resumeText: payload.profile.resumeText || "",
            resumeFileName: payload.profile.resumeFileName || "",
            careerGoals: payload.profile.careerGoals || "",
            preferences: payload.profile.preferences || {},
          });
        }
      } catch {
        setCloudSync(false);
        setProfile({
          ...emptyProfile,
          ...(readLocalProfile(user?.id) || {}),
        });
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadProfile();
    }
  }, [isLoaded, user?.id]);

  const updateField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      const payload = await response.json();

      if (response.ok && payload.databaseConfigured === false) {
        writeLocalProfile(profile, user?.id);
        setCloudSync(false);
        toast.success("Profile saved locally");
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save profile");
      }

      writeLocalProfile(profile, user?.id);
      setCloudSync(true);
      toast.success("Profile context saved");
      router.push("/dashboard");
    } catch {
      writeLocalProfile(profile, user?.id);
      setCloudSync(false);
      toast.success("Profile saved locally");
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-12 pt-32 text-white md:pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <UserRound className="text-cyan-300" size={30} />
          <div>
            <h1 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
              Candidate Profile
            </h1>
            <p className="mt-2 text-gray-300">
              Store reusable resume, skill, and goal context for grounded interview generation.
            </p>
            {!cloudSync && (
              <p className="mt-2 text-sm text-yellow-300">
                Local mode: add `DATABASE_URL` to sync this profile to Neon per Clerk user.
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-gray-300">
            Loading profile...
          </div>
        ) : (
          <form onSubmit={saveProfile} className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6">
            <Field label="Target Roles">
              <Input
                placeholder="Frontend Engineer, Full Stack Developer, ML Engineer"
                value={profile.targetRoles}
                onChange={(event) => updateField("targetRoles", event.target.value)}
                className="border-white/20 bg-white/10 text-white"
              />
            </Field>

            <Field label="Skills">
              <Textarea
                placeholder="React, Next.js, Node.js, PostgreSQL, system design, DSA..."
                value={profile.skills}
                onChange={(event) => updateField("skills", event.target.value)}
                className="min-h-[100px] border-white/20 bg-white/10 text-white"
              />
            </Field>

            <Field label="Resume Upload">
              <ResumeUpload
                value={profile.resumeText}
                fileName={profile.resumeFileName}
                onChange={({ text, fileName }) => {
                  updateField("resumeText", text);
                  updateField("resumeFileName", fileName);
                }}
              />
            </Field>

            <Field label="Career Goals">
              <Textarea
                placeholder="Companies, roles, interview loops, weak areas, and goals for the next 30 days."
                value={profile.careerGoals}
                onChange={(event) => updateField("careerGoals", event.target.value)}
                className="min-h-[120px] border-white/20 bg-white/10 text-white"
              />
            </Field>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Context"}
              </Button>
            </div>
          </form>
        )}
      </div>
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

export default ProfilePage;
