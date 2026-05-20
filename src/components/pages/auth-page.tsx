"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Lock, UserPlus } from "lucide-react";
import { useFitQuest } from "@/components/app-provider";
import { advancedUserId, fatherUserId } from "@/lib/demo-data";
import { Card, Input, PrimaryButton, SecondaryButton } from "@/components/ui";

export function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, switchDemoUser, supabaseReady, authError } = useFitQuest();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("max@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Max");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const ok =
      mode === "login" ? await signIn(email, password) : await signUp(email, password, name);
    setSubmitting(false);
    if (ok) router.push(mode === "signup" ? "/onboarding" : "/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-zinc-100 px-4 py-8 text-zinc-950 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">FitQuest</span>
        </Link>

        <Card>
          <div className="mb-6 flex gap-2 rounded-lg bg-zinc-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`h-10 flex-1 rounded-md text-sm font-semibold ${
                mode === "login" ? "bg-white shadow-sm" : "text-zinc-500"
              }`}
              type="button"
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`h-10 flex-1 rounded-md text-sm font-semibold ${
                mode === "signup" ? "bg-white shadow-sm" : "text-zinc-500"
              }`}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Name</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {authError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {authError}
              </p>
            ) : null}
            <PrimaryButton type="submit" disabled={submitting} className="w-full">
              {mode === "login" ? <Lock className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {submitting ? "Working..." : mode === "login" ? "Log in" : "Create account"}
            </PrimaryButton>
          </form>
        </Card>
      </section>

      <section className="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center lg:mt-0">
        <Card className="bg-zinc-950 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {supabaseReady ? "Supabase connected" : "Demo mode active"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Two accounts, one shared quest.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300">
            Use Supabase credentials when configured, or open the seeded accounts for a full local
            MVP preview.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SecondaryButton
              onClick={() => {
                switchDemoUser(advancedUserId);
                router.push("/dashboard");
              }}
            >
              Open Max
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                switchDemoUser(fatherUserId);
                router.push("/dashboard");
              }}
            >
              Open Father
            </SecondaryButton>
          </div>
        </Card>
      </section>
    </main>
  );
}
