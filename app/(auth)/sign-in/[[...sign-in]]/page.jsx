import { SignIn } from "@clerk/nextjs";
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
            <h1 className="text-4xl font-bold">AI Mock Interview</h1>
            <p className="mt-4 text-lg text-blue-50">
              Practice with role-specific questions, rubric scoring, grounded feedback, and personalized
              coaching.
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md text-center">
            <h2 className="mb-2 text-3xl font-bold">Welcome back</h2>
            <p className="mb-8 text-gray-300">Sign in to continue your interview practice.</p>
            <div className="flex justify-center">
              <SignIn
                appearance={clerkAppearance}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
              />
            </div>
            <p className="mt-6 text-sm text-gray-400">
              New here?{" "}
              <Link href="/sign-up" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Create an account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}
