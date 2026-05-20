"use client";

import { Activity, Crown, Dumbbell, Flame, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { Card, ProgressBar, SectionTitle } from "@/components/ui";
import type { AvatarBodyPartScores, QuestAvatarStats } from "@/lib/types";
import { cn } from "@/lib/utils";

const bodyPartLabels: { key: keyof AvatarBodyPartScores; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "triceps", label: "Triceps" },
  { key: "back", label: "Back" },
  { key: "biceps", label: "Biceps" },
  { key: "legs", label: "Legs" },
];

export function QuestAvatarCard({ stats }: { stats: QuestAvatarStats }) {
  return (
    <Card className="overflow-hidden bg-zinc-950 p-0 text-white">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[360px] overflow-hidden bg-zinc-950 p-5">
          <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-emerald-500/10" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Training form
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">Quest Avatar</h2>
          </div>
          <div className="relative mt-4 flex justify-center">
            <AvatarFigure stats={stats} />
          </div>
          <div className="relative mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
            <div>
              <p className="text-sm text-zinc-400">Current form</p>
              <p className="mt-1 text-lg font-semibold">{stats.form}</p>
            </div>
            <div className="rounded-lg bg-amber-400/15 p-2 text-amber-200 ring-1 ring-amber-300/20">
              <Crown className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white p-5 text-zinc-950 lg:border-l lg:border-t-0">
          <SectionTitle title="Avatar Growth" eyebrow="Personal progress" />
          <div className="grid gap-3 sm:grid-cols-2">
            <AvatarMetric
              icon={Dumbbell}
              label="Power"
              value={stats.power}
              detail={`${stats.workoutCount} strength sessions`}
              tone="emerald"
            />
            <AvatarMetric
              icon={Activity}
              label="Endurance"
              value={stats.endurance}
              detail={`${stats.runCount} runs logged`}
              tone="amber"
            />
            <AvatarMetric
              icon={Flame}
              label="Consistency"
              value={stats.consistency}
              detail={`Level ${stats.level} momentum`}
              tone="rose"
            />
            <AvatarMetric
              icon={ShieldCheck}
              label="Prestige"
              value={stats.prestige}
              detail={stats.nextForm ? `Next: ${stats.nextForm}` : "Top form unlocked"}
              tone="zinc"
            />
          </div>
          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <ProgressBar value={stats.trainingScore} label="Overall avatar strength" />
          </div>
          <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Body parts trained</p>
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-600">
                Strongest: {stats.dominantBodyPart}
              </span>
            </div>
            <div className="space-y-3">
              {bodyPartLabels.map((part) => (
                <ProgressBar
                  key={part.key}
                  value={stats.bodyParts[part.key]}
                  label={part.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AvatarFigure({ stats }: { stats: QuestAvatarStats }) {
  const chestScore = stats.bodyParts.chest;
  const armScore = Math.max(stats.bodyParts.biceps, stats.bodyParts.triceps);
  const backScore = stats.bodyParts.back;
  const legScore = stats.bodyParts.legs;
  const powerScale = 1 + stats.power / 450;
  const torsoWidth = 52 + chestScore * 0.13 + backScore * 0.11;
  const auraOpacity = 0.16 + stats.endurance / 260;
  const shoulderWidth = 90 + chestScore * 0.3 + backScore * 0.22;
  const armOffset = armScore * 0.09;
  const legOffset = legScore * 0.08;
  const badgeDots = Math.min(5, Math.floor(stats.prestige / 18));
  const hasCrown = stats.level >= 5;
  const hasCape = stats.consistency >= 55;
  const hasAura = stats.endurance >= 35;
  const hasArmor = stats.power >= 35 || stats.level >= 3;

  return (
    <svg
      viewBox="0 0 260 300"
      role="img"
      aria-label={`${stats.form} avatar`}
      className="h-[300px] w-full max-w-[300px]"
    >
      <defs>
        <linearGradient id="avatarArmor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="avatarCape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
        </linearGradient>
        <filter id="avatarGlow">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="130" cy="263" rx="74" ry="15" fill="#020617" opacity="0.5" />
      {hasAura ? (
        <circle
          cx="130"
          cy="148"
          r={78 + stats.endurance * 0.34}
          fill="none"
          stroke="#34d399"
          strokeWidth="10"
          opacity={auraOpacity}
          filter="url(#avatarGlow)"
        />
      ) : null}
      {hasCape ? (
        <path
          d="M88 95 C55 136 57 214 91 258 C107 243 153 243 169 258 C203 212 202 135 172 95 Z"
          fill="url(#avatarCape)"
        />
      ) : null}
      <g transform={`translate(130 160) scale(${powerScale}) translate(-130 -160)`}>
        <path
          d={`M${130 - shoulderWidth / 2} 128 C91 140 77 176 77 213 L96 219 C103 190 113 169 130 164 C147 169 157 190 164 219 L183 213 C183 176 169 140 ${130 + shoulderWidth / 2} 128 Z`}
          fill="#064e3b"
          opacity="0.95"
        />
        <path
          d={`M${130 - torsoWidth / 2} 132 C107 147 103 202 112 238 C122 246 138 246 148 238 C157 202 153 147 ${130 + torsoWidth / 2} 132 Z`}
          fill={hasArmor ? "url(#avatarArmor)" : "#52525b"}
          stroke="#d1fae5"
          strokeOpacity="0.25"
          strokeWidth="2"
        />
        <path
          d={`M101 142 C${82 - armOffset} 159 ${72 - armOffset} 184 ${64 - armOffset} 215 L${83 - armOffset * 0.4} 221 C91 192 101 174 116 160 Z`}
          fill="#27272a"
        />
        <path
          d={`M159 142 C${178 + armOffset} 159 ${188 + armOffset} 184 ${196 + armOffset} 215 L${177 + armOffset * 0.4} 221 C169 192 159 174 144 160 Z`}
          fill="#27272a"
        />
        <path
          d={`M104 224 L${94 - legOffset} 262 L${118 - legOffset * 0.3} 262 L127 228 Z`}
          fill="#18181b"
          opacity={0.72 + legScore / 360}
        />
        <path
          d={`M156 224 L${166 + legOffset} 262 L${142 + legOffset * 0.3} 262 L133 228 Z`}
          fill="#18181b"
          opacity={0.72 + legScore / 360}
        />
        <circle cx="130" cy="92" r="31" fill="#f5d0a9" />
        <path d="M101 89 C106 61 154 56 161 90 C143 81 120 81 101 89 Z" fill="#18181b" />
        <path d="M116 96 Q130 106 144 96" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M110 156 C118 150 125 149 130 160 C135 149 142 150 150 156"
          fill="none"
          stroke="#a7f3d0"
          strokeOpacity={0.2 + chestScore / 140}
          strokeWidth={2 + chestScore / 35}
          strokeLinecap="round"
        />
        <path
          d="M112 180 C122 187 138 187 148 180"
          fill="none"
          stroke="#fcd34d"
          strokeOpacity={0.18 + backScore / 150}
          strokeWidth={2 + backScore / 45}
          strokeLinecap="round"
        />
        {hasArmor ? <path d="M111 146 L130 166 L149 146" fill="none" stroke="#a7f3d0" strokeWidth="4" /> : null}
      </g>

      {hasCrown ? (
        <path
          d="M102 54 L116 32 L130 52 L146 32 L158 54 L154 68 L106 68 Z"
          fill="#f59e0b"
          stroke="#fde68a"
          strokeWidth="2"
        />
      ) : null}
      <g transform="translate(91 272)">
        {Array.from({ length: badgeDots }).map((_, index) => (
          <circle key={index} cx={index * 19} cy="0" r="5" fill="#fbbf24" opacity="0.9" />
        ))}
      </g>
      <Sparkles className="text-emerald-200" x={203} y={51} width={18} height={18} />
    </svg>
  );
}

function AvatarMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  tone: "emerald" | "amber" | "rose" | "zinc";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    zinc: "bg-zinc-100 text-zinc-700",
  }[tone];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className={cn("rounded-lg p-2", toneClass)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
    </div>
  );
}
