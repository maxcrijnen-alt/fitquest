"use client";

import { FormEvent, useState } from "react";
import { HeartHandshake, MessageCircle, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { RelativeStrengthChart } from "@/components/charts";
import { BadgePill, Card, Input, PrimaryButton, ProgressBar, SecondaryButton } from "@/components/ui";
import { buildPartnerSummary, calculateRelativeStrengthScores, weeklyXp } from "@/lib/fitness";

const encouragementOptions = ["Nice work!", "Great consistency!", "Strong week!", "Keep going!", "Proud of you!"];

export function FamilyPage() {
  const {
    state,
    profile,
    createPartnerInvite,
    acceptPartnerInvite,
    sendEncouragement,
    refreshAccountData,
  } = useFitQuest();
  const [invite, setInvite] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const partner = buildPartnerSummary(state, profile.id);
  const pendingInvite = state.partnerConnections.find(
    (connection) => connection.requester_id === profile.id && connection.status === "pending",
  );
  const relativeStrengthData = partner
    ? [
        ...calculateRelativeStrengthScores(state, [profile.id]),
        {
          userId: partner.profile.id,
          name: partner.profile.name,
          age: partner.age,
          bodyWeightKg: partner.bodyWeightKg,
          weightClass: partner.weightClass,
          relativeStrength: partner.relativeStrength,
          ageAdjustedStrength: partner.ageAdjustedStrength,
          ageMultiplier: partner.ageMultiplier,
          liftCount: partner.liftCount,
        },
      ]
    : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await acceptPartnerInvite(invite);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Partner dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Family progress</h1>
      </div>

      {!partner ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="text-xl font-semibold">Create your invite</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Share this code with your family partner. They enter it on their own account to
              connect.
            </p>
            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-500">Invite code</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal">
                {latestInviteCode || pendingInvite?.invite_code || "No code yet"}
              </p>
            </div>
            <PrimaryButton
              type="button"
              className="mt-4"
              onClick={async () => {
                const code = await createPartnerInvite();
                if (code) setLatestInviteCode(code);
              }}
            >
              <HeartHandshake className="h-4 w-4" aria-hidden="true" />
              Generate invite
            </PrimaryButton>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Accept an invite</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Enter your partner&apos;s invite code to create a pending-safe family connection.
            </p>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                value={invite}
                placeholder="FIT-ABCD-1234"
                onChange={(event) => setInvite(event.target.value.toUpperCase())}
              />
              <PrimaryButton type="submit">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                Connect
              </PrimaryButton>
            </form>
            <SecondaryButton type="button" className="mt-3" onClick={() => void refreshAccountData()}>
              Refresh status
            </SecondaryButton>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">Connected partner</p>
                <h2 className="mt-1 text-2xl font-semibold">{partner.profile.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{partner.profile.nickname}</p>
              </div>
              <HeartHandshake className="h-8 w-8 text-emerald-700" aria-hidden="true" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <SummaryBox label="XP" value={partner.xp.toLocaleString()} />
              <SummaryBox label="Level" value={String(partner.level)} />
              <SummaryBox label="Streak" value={`${partner.streak}`} />
              <SummaryBox label="Weekly XP" value={String(partner.weeklyXp)} />
            </div>

            <div className="mt-6">
              <ProgressBar value={partner.weeklyCompletion} label="Weekly completion" />
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Recent milestones
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {partner.milestones.map((milestone) => (
                  <span key={milestone} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
                    {milestone}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Encouragement</h2>
            <div className="mt-4 grid gap-2">
              {encouragementOptions.map((message) => (
                <SecondaryButton
                  key={message}
                  type="button"
                  onClick={() => sendEncouragement(partner.profile.id, message)}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {message}
                </SecondaryButton>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {partner.encouragements.map((message) => (
                <div key={message} className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm font-medium">
                  <MessageCircle className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  {message}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {partner ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="text-xl font-semibold">Relative strength index</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              This normalizes each person&apos;s top three estimated lifts by bodyweight, then
              applies a simple age adjustment. It is a family-only index, not a raw lift comparison.
            </p>
            <div className="mt-4">
              <RelativeStrengthChart data={relativeStrengthData} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relativeStrengthData.map((score) => (
                <div key={score.userId} className="rounded-lg bg-zinc-50 p-4">
                  <p className="font-semibold">{score.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Age {score.age} / {score.bodyWeightKg} kg / {score.weightClass} class
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    Age multiplier {score.ageMultiplier}x / {score.liftCount} lifts counted
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Gamified comparison</h2>
            <div className="mt-4 space-y-4">
              <CompareLine label="Weekly XP" mine={weeklyXp(state, profile.id)} partner={partner.weeklyXp} />
              <CompareLine label="Level" mine={profile.level} partner={partner.level} />
              <CompareLine label="Streak" mine={profile.current_streak} partner={partner.streak} />
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold">Partner badges</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {partner.badges.slice(0, 6).map((badge) => (
                <BadgePill key={badge.id} icon={badge.icon} label={badge.name} />
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-6 text-zinc-700">
            Family mode keeps raw lift numbers, calories, protein, alcohol logs, and full workout
            logs private. The relative strength chart shares only a normalized age/bodyweight
            index so the comparison is less sensitive than direct lift numbers.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function CompareLine({ label, mine, partner }: { label: string; mine: number; partner: number }) {
  const total = Math.max(mine + partner, 1);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-zinc-500">
          You {mine} / Partner {partner}
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="bg-emerald-500" style={{ width: `${Math.max(4, (mine / total) * 100)}%` }} />
        <div className="bg-amber-400" style={{ width: `${Math.max(4, (partner / total) * 100)}%` }} />
      </div>
    </div>
  );
}
