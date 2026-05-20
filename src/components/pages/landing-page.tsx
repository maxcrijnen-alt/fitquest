"use client";

import Link from "next/link";
import { Activity, BadgeCheck, Dumbbell, Flame, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { useFitQuest } from "@/components/app-provider";
import { Card, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/ui";
import { buildPartnerSummary, todayISO } from "@/lib/fitness";

const previewTasks = [
  { id: "preview-strength", title: "Log a strength workout", category: "strength", xp_reward: 50 },
  { id: "preview-run", title: "Complete an easy run", category: "running", xp_reward: 50 },
  { id: "preview-protein", title: "Hit protein target", category: "protein", xp_reward: 25 },
  { id: "preview-water", title: "Hit water target", category: "water", xp_reward: 20 },
  { id: "preview-mobility", title: "Mobility reset", category: "mobility", xp_reward: 15 },
] as const;

export function LandingPage() {
  const { profile, state, supabaseReady, authStatus } = useFitQuest();
  const isPublicOnline = supabaseReady && authStatus !== "authenticated";
  const partner = isPublicOnline ? null : buildPartnerSummary(state, profile.id);
  const todayTasks = state.tasks.filter((task) => task.user_id === profile.id && task.task_date === todayISO());
  const displayedTasks = isPublicOnline ? previewTasks : todayTasks;
  const completed = isPublicOnline ? 0 : todayTasks.filter((task) => task.completed).length;
  const level = isPublicOnline ? 1 : profile.level;
  const streak = isPublicOnline ? 0 : profile.current_streak;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">FitQuest</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/auth">
              <SecondaryButton>{authStatus === "authenticated" ? "Account" : "Log in"}</SecondaryButton>
            </Link>
            {supabaseReady ? (
              <Link href={authStatus === "authenticated" ? "/dashboard" : "/auth"}>
                <PrimaryButton>{authStatus === "authenticated" ? "Dashboard" : "Sign up"}</PrimaryButton>
              </Link>
            ) : (
              <Link href="/dashboard">
                <PrimaryButton>Open demo</PrimaryButton>
              </Link>
            )}
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Fitness tracker with light RPG progress
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-zinc-950 sm:text-6xl">
              FitQuest
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
              A private father-son training dashboard for strength, running, lifestyle habits,
              XP, levels, streaks, badges, and family encouragement. Real accounts start fresh
              at level 1 with no earned XP.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={authStatus === "authenticated" ? "/dashboard" : "/auth"}>
                <PrimaryButton>Start tracking</PrimaryButton>
              </Link>
              <Link href="/family">
                <SecondaryButton>
                  <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  Family dashboard
                </SecondaryButton>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <Card className="min-h-[420px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Today</p>
                  <h2 className="mt-1 text-2xl font-semibold">Quest board</h2>
                </div>
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Level {level}
                </span>
              </div>
              <div className="mt-5">
                <ProgressBar value={completed} max={Math.max(displayedTasks.length, 1)} label="Daily completion" />
              </div>
              <div className="mt-5 space-y-3">
                {displayedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-zinc-200">
                      {task.category === "strength" ? (
                        <Dumbbell className="h-4 w-4" aria-hidden="true" />
                      ) : task.category === "running" ? (
                        <Activity className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{task.title}</p>
                      <p className="text-xs text-zinc-500">+{task.xp_reward} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-4">
              <Card>
                <Flame className="h-6 w-6 text-amber-600" aria-hidden="true" />
                <p className="mt-4 text-3xl font-semibold">{streak}</p>
                <p className="mt-1 text-sm text-zinc-500">day streak</p>
              </Card>
              <Card>
                <ShieldCheck className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold">Private by default</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Partners see summaries, not raw workout, nutrition, or alcohol logs.
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-zinc-500">Partner</p>
                <p className="mt-2 text-2xl font-semibold">{partner?.profile.name ?? "Not connected"}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {partner
                    ? `${partner.weeklyCompletion}% weekly completion`
                    : "Connect with an invite code after signup"}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
