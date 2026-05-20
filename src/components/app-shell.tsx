"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Gauge,
  Gift,
  HeartHandshake,
  Home,
  LogOut,
  RotateCcw,
  Salad,
  Settings,
  Trophy,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useFitQuest } from "@/components/app-provider";
import { ProgressBar } from "@/components/ui";
import { xpIntoCurrentLevel } from "@/lib/fitness";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/log/strength", label: "Strength", icon: Dumbbell },
  { href: "/log/run", label: "Run", icon: Activity },
  { href: "/lifestyle", label: "Lifestyle", icon: Salad },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/family", label: "Family", icon: HeartHandshake },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut, supabaseReady, authStatus, authError, notice, clearNotice, retryAuthLoad } =
    useFitQuest();
  const mustOnboard = supabaseReady && authStatus === "authenticated" && !profile.onboarding_completed;
  const isLoading = supabaseReady && authStatus === "loading";
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    if (mustOnboard && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [mustOnboard, pathname, router]);

  useEffect(() => {
    if (!isLoading) {
      const resetTimer = window.setTimeout(() => setSlowLoading(false), 0);
      return () => window.clearTimeout(resetTimer);
    }
    const timer = window.setTimeout(() => setSlowLoading(true), 8000);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <CenteredState
        title="Loading FitQuest"
        text={
          slowLoading
            ? "This is taking longer than expected. Retry the account check, or open the login screen again."
            : "Preparing your account data."
        }
        action={
          slowLoading ? (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => void retryAuthLoad()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
              <Link
                href="/auth"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700"
              >
                Go to login
              </Link>
            </div>
          ) : undefined
        }
      />
    );
  }

  if (supabaseReady && authStatus === "error") {
    return (
      <CenteredState
        title="Could not load FitQuest"
        text={authError ?? "The account check failed. Retry first; if it keeps happening, log in again."}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => void retryAuthLoad()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
            <button
              onClick={() => void signOut()}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700"
            >
              Log in again
            </button>
          </div>
        }
      />
    );
  }

  if (supabaseReady && authStatus === "anonymous") {
    return (
      <CenteredState
        title="Log in to continue"
        text="Your online FitQuest account keeps your data private and synced."
        action={
          <Link
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
          >
            Go to login
          </Link>
        }
      />
    );
  }

  if (mustOnboard && pathname !== "/onboarding") {
    return <CenteredState title="Onboarding needed" text="Redirecting you to finish your profile." />;
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      {notice ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-1 h-2.5 w-2.5 rounded-full",
                notice.tone === "success" && "bg-emerald-500",
                notice.tone === "error" && "bg-rose-500",
                notice.tone === "info" && "bg-amber-500",
              )}
            />
            <p className="flex-1 text-sm font-medium leading-5 text-zinc-800">{notice.message}</p>
            <button onClick={clearNotice} className="text-zinc-400 hover:text-zinc-700" title="Dismiss">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex h-20 items-center gap-3 px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-normal">FitQuest</p>
            <p className="text-xs font-medium text-zinc-500">Fitness tracker RPG</p>
          </div>
        </Link>

        <div className="mx-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-zinc-500">{profile.nickname}</p>
            </div>
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-700">
              Lv {profile.level}
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar value={xpIntoCurrentLevel(profile.xp)} max={500} label="Level XP" />
          </div>
        </div>

        <nav className="mt-5 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
                  active && "bg-zinc-950 text-white hover:bg-zinc-950 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <button
            onClick={() => void signOut()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Home className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-semibold">FitQuest</span>
          </Link>
          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-700">
            Lv {profile.level}
          </span>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-zinc-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-zinc-500",
                active && "bg-zinc-950 text-white",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.mobileLabel ?? item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: Gauge },
  { href: "/log/strength", label: "Strength", icon: Dumbbell },
  { href: "/log/run", label: "Run", icon: Activity },
  { href: "/family", label: "Family", icon: HeartHandshake },
  { href: "/settings", label: "Settings", icon: Settings },
];

function CenteredState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <Trophy className="mx-auto h-8 w-8 text-emerald-700" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </section>
    </main>
  );
}
