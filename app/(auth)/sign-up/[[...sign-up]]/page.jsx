import { SignUp } from "@clerk/nextjs";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import { clerkAppearance } from "@/utils/clerkAppearance";

export default function Page() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 text-white">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
        <section className="hidden items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-700 p-10 lg:flex">
          <div className="max-w-md">
            <BrainCircuit className="mb-6 text-white" size={48} />
            <h1 className="text-4xl font-bold">Build Interview Readiness</h1>
            <p className="mt-4 text-lg text-blue-50">
              Generate targeted interviews from your resume, target role, company notes, and skill gaps.
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md text-center">
            <h2 className="mb-2 text-3xl font-bold">Create your account</h2>
            <p className="mb-8 text-gray-300">Start saving sessions, reports, and practice plans.</p>
            <div className="flex justify-center">
              <SignUp
                appearance={clerkAppearance}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
              />
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}
