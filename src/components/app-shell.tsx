"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Gauge,
  Gift,
  HeartHandshake,
  Home,
  LogOut,
  Salad,
  Settings,
  Trophy,
} from "lucide-react";
import { ReactNode } from "react";
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
  const { profile, signOut } = useFitQuest();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
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
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-600",
                  active && "border-zinc-950 bg-zinc-950 text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
