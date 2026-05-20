"use client";

import {
  Activity,
  Award,
  CheckCircle2,
  Coins,
  Dumbbell,
  Flame,
  Gauge,
  HeartHandshake,
  Medal,
  Sparkles,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { RunningProgressChart, StrengthVolumeChart, WeeklyCompletionChart } from "@/components/charts";
import { QuestAvatarCard } from "@/components/quest-avatar";
import { BadgePill, Card, MetricCard, PrimaryButton, ProgressBar, SectionTitle, SecondaryButton } from "@/components/ui";
import {
  buildPartnerSummary,
  calculatePersonalRecords,
  calculateQuestAvatarStats,
  formatDuration,
  generateCoachingSummary,
  getEarnedBadges,
  getLifestyleLogs,
  getRuns,
  getStrengthWorkouts,
  getWorkoutExercises,
  lifestyleHabitSummary,
  runningChartData,
  strengthChartData,
  todayISO,
  weeklyCompletion,
  weeklyXp,
  xpIntoCurrentLevel,
} from "@/lib/fitness";
import { FitQuestState, WorkoutResultSummary } from "@/lib/types";
import { numberCompact } from "@/lib/utils";

export function DashboardPage() {
  const { state, profile, completeTask, lastWorkoutResult, clearWorkoutResult } = useFitQuest();
  const workouts = getStrengthWorkouts(state, profile.id);
  const exercises = workouts.flatMap((workout) => getWorkoutExercises(state, workout.id));
  const runs = getRuns(state, profile.id);
  const lifestyleLogs = getLifestyleLogs(state, profile.id);
  const records = calculatePersonalRecords(workouts, exercises, runs);
  const badges = getEarnedBadges(state, profile.id);
  const todayTasks = state.tasks.filter(
    (task) => task.user_id === profile.id && task.task_date === todayISO(),
  );
  const lifestyle = lifestyleHabitSummary(profile, lifestyleLogs);
  const partnerSummary = buildPartnerSummary(state, profile.id);
  const coaching = generateCoachingSummary(profile, state);
  const weeklyCompletionValue = weeklyCompletion(state.tasks, profile.id);
  const avatarStats = calculateQuestAvatarStats({
    profile,
    workouts,
    exercises,
    runs,
    badgeCount: badges.length,
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Main dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            Today&apos;s quest, {profile.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Build consistency through XP, levels, streaks, badges, and personal progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/log/strength">
            <PrimaryButton>
              <Dumbbell className="h-4 w-4" aria-hidden="true" />
              Strength
            </PrimaryButton>
          </Link>
          <Link href="/log/run">
            <SecondaryButton>
              <Activity className="h-4 w-4" aria-hidden="true" />
              Run
            </SecondaryButton>
          </Link>
        </div>
      </div>

      {lastWorkoutResult ? (
        <WorkoutResultPanel result={lastWorkoutResult} onDismiss={clearWorkoutResult} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="XP"
          value={profile.xp.toLocaleString()}
          detail={`${xpIntoCurrentLevel(profile.xp)} / 500 XP toward next level`}
          icon={Sparkles}
          tone="emerald"
        />
        <MetricCard
          label="Level"
          value={`Level ${profile.level}`}
          detail={`${weeklyXp(state, profile.id)} XP earned this week`}
          icon={Gauge}
          tone="zinc"
        />
        <MetricCard
          label="Current streak"
          value={`${profile.current_streak} days`}
          detail={`${weeklyCompletionValue}% weekly task completion`}
          icon={Flame}
          tone="amber"
        />
        <MetricCard
          label="Coins"
          value={profile.coins.toLocaleString()}
          detail="Spend coins on self-defined real-life rewards"
          icon={Coins}
          tone="rose"
        />
      </div>

      <div className="mt-6">
        <QuestAvatarCard stats={avatarStats} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle title="Today's Tasks" eyebrow="Dynamic plan" />
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-zinc-200">
                    <CheckCircle2
                      className={task.completed ? "h-5 w-5 fill-emerald-100" : "h-5 w-5"}
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <p className="font-semibold text-zinc-950">{task.title}</p>
                    <p className="mt-1 text-sm leading-5 text-zinc-600">{task.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      {task.difficulty} / +{task.xp_reward} XP / +{task.coin_reward} coins
                    </p>
                  </div>
                </div>
                <SecondaryButton
                  disabled={task.completed}
                  onClick={() => completeTask(task.id)}
                  className="shrink-0"
                >
                  {task.completed ? "Done" : "Complete"}
                </SecondaryButton>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Weekly Progress" eyebrow="Consistency" />
          <ProgressBar value={weeklyCompletionValue} label="Task completion" />
          <div className="mt-5">
            <WeeklyCompletionChart data={buildWeeklyTaskData(state, profile.id)} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Strength Progress" eyebrow="Volume trend" />
          <StrengthVolumeChart data={strengthChartData(workouts)} />
        </Card>
        <Card>
          <SectionTitle title="Running / 5K Progress" eyebrow="Distance and pace" />
          <RunningProgressChart data={runningChartData(runs)} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <SectionTitle title="Personal Records" eyebrow="Private detail" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Best 5K</p>
              <p className="mt-2 text-2xl font-semibold">
                {records.bestFiveKTime ? formatDuration(records.bestFiveKTime) : "Not yet"}
              </p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Highest volume</p>
              <p className="mt-2 text-2xl font-semibold">
                {numberCompact(records.highestWorkoutVolume)} kg
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {records.exercises.slice(0, 4).map((record) => (
              <div key={record.exerciseName} className="rounded-lg border border-zinc-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{record.exerciseName}</p>
                  <Trophy className="h-4 w-4 text-amber-600" aria-hidden="true" />
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  {record.highestWeight} kg best weight / {record.highestEstimatedOneRepMax} kg est. 1RM
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Lifestyle Habit Summary" eyebrow="Last 7 days" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ProgressBar value={lifestyle.protein} label="Protein target" />
            <ProgressBar value={lifestyle.water} label="Water target" />
            <ProgressBar value={lifestyle.calories} label="Calorie range" />
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-500">Alcohol-free days</p>
              <p className="mt-2 text-2xl font-semibold">{lifestyle.alcoholFreeDays} / 7</p>
            </div>
          </div>
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">Weekly feedback</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950">
              {coaching.weeklyFeedback.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Earned Badges" eyebrow="Achievements" />
          <div className="grid gap-3 sm:grid-cols-2">
            {badges.slice(0, 8).map((badge) => (
              <BadgePill key={badge.id} icon={badge.icon} label={badge.name} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Partner Summary" eyebrow="Family" />
          {partnerSummary ? (
            <div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 p-4">
                <div>
                  <p className="text-lg font-semibold">{partnerSummary.profile.name}</p>
                  <p className="text-sm text-zinc-500">{partnerSummary.profile.nickname}</p>
                </div>
                <HeartHandshake className="h-7 w-7 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 p-3">
                  <p className="text-sm text-zinc-500">Level</p>
                  <p className="mt-1 text-xl font-semibold">{partnerSummary.level}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 p-3">
                  <p className="text-sm text-zinc-500">Streak</p>
                  <p className="mt-1 text-xl font-semibold">{partnerSummary.streak}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 p-3">
                  <p className="text-sm text-zinc-500">Weekly XP</p>
                  <p className="mt-1 text-xl font-semibold">{partnerSummary.weeklyXp}</p>
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={partnerSummary.weeklyCompletion} label="Weekly completion" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {partnerSummary.milestones.map((milestone) => (
                  <span key={milestone} className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800">
                    {milestone}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-600">No partner connected yet.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Rule-Based Coaching" eyebrow="Next moves" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[coaching.strengthSuggestion, coaching.runningSuggestion, coaching.habitSuggestion, coaching.goalAdjustment].map(
            (item) => (
              <div key={item} className="rounded-lg bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
                <Medal className="mb-3 h-5 w-5 text-emerald-700" aria-hidden="true" />
                {item}
              </div>
            ),
          )}
        </div>
      </Card>
    </AppShell>
  );
}

function WorkoutResultPanel({
  result,
  onDismiss,
}: {
  result: WorkoutResultSummary;
  onDismiss: () => void;
}) {
  const topChanges = result.avatarBodyPartChanges.filter((part) => part.delta > 0).slice(0, 4);

  return (
    <Card className="mb-6 border-emerald-200 bg-emerald-50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Workout complete
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
                {result.splitType} saved
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                {numberCompact(result.totalVolume)} kg volume. Next suggested split:
                {" "}
                <span className="font-semibold">{result.suggestedNextSplit}</span>.
                {" "}
                {result.suggestedReason}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
              title="Dismiss workout result"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ResultMetric icon={Sparkles} label="XP earned" value={`+${result.xpEarned}`} />
            <ResultMetric icon={Coins} label="Coins earned" value={`+${result.coinsEarned}`} />
            <ResultMetric icon={Dumbbell} label="Volume" value={`${numberCompact(result.totalVolume)} kg`} />
          </div>
        </div>

        <div className="grid gap-4 xl:w-[420px]">
          <div className="rounded-lg border border-emerald-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">Avatar changes</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {result.avatarFormBefore === result.avatarFormAfter
                    ? result.avatarFormAfter
                    : `${result.avatarFormBefore} -> ${result.avatarFormAfter}`}
                </p>
              </div>
              <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <div className="mt-3 space-y-3">
              {topChanges.length ? (
                topChanges.map((part) => (
                  <ProgressBar
                    key={part.key}
                    value={part.after}
                    label={`${part.label} +${part.delta}`}
                  />
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  Avatar balance stayed steady. Add more volume or a lagging split to move the bars.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ResultList title="PRs" items={result.prMessages} empty="No new PRs this time." />
            <ResultList title="Unlocked" items={result.badgeNames} empty="No new badges this time." />
          </div>
          {result.xpReasons.length ? (
            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-950">Rewards came from</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.xpReasons.map((reason) => (
                  <span key={reason} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ResultMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <Icon className="h-4 w-4 text-emerald-700" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function ResultList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-4">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length ? (
          items.map((item) => (
            <p key={item} className="text-sm leading-5 text-zinc-600">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm leading-5 text-zinc-500">{empty}</p>
        )}
      </div>
    </div>
  );
}

function buildWeeklyTaskData(state: FitQuestState, userId: string) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const iso = date.toISOString().slice(0, 10);
    const dayTasks = state.tasks.filter((task) => task.user_id === userId && task.task_date === iso);
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      completed: dayTasks.filter((task) => task.completed).length,
      total: dayTasks.length,
    };
  });
  return days;
}
