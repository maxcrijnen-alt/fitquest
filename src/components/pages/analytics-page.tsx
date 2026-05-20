"use client";

import { Activity, Dumbbell, Gauge } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { RunningProgressChart, StrengthVolumeChart } from "@/components/charts";
import { Card, MetricCard, ProgressBar, SectionTitle } from "@/components/ui";
import {
  calculatePersonalRecords,
  formatDuration,
  formatPace,
  generateCoachingSummary,
  getRuns,
  getStrengthWorkouts,
  getWorkoutExercises,
  runningChartData,
  strengthChartData,
} from "@/lib/fitness";
import { numberCompact } from "@/lib/utils";

export function AnalyticsPage() {
  const { state, profile } = useFitQuest();
  const workouts = getStrengthWorkouts(state, profile.id);
  const exercises = workouts.flatMap((workout) => getWorkoutExercises(state, workout.id));
  const runs = getRuns(state, profile.id);
  const records = calculatePersonalRecords(workouts, exercises, runs);
  const coaching = generateCoachingSummary(profile, state);
  const weeklyRunningVolume = runs
    .filter((run) => {
      const date = new Date(`${run.run_date}T00:00:00`);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 6);
      return date >= cutoff;
    })
    .reduce((total, run) => total + run.distance_km, 0);
  const latestRun = runs.at(-1);
  const goalProgress = latestRun ? Math.min(100, Math.round((latestRun.distance_km / 5) * 100)) : 0;

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Progress analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Highest workout volume"
          value={`${numberCompact(records.highestWorkoutVolume)} kg`}
          detail="Private strength detail, visible only to you"
          icon={Dumbbell}
          tone="emerald"
        />
        <MetricCard
          label="Weekly running volume"
          value={`${weeklyRunningVolume.toFixed(1)} km`}
          detail={latestRun ? `Latest pace ${formatPace(latestRun.pace_per_km)}` : "Log a run to begin"}
          icon={Activity}
          tone="amber"
        />
        <MetricCard
          label="Best 5K"
          value={records.bestFiveKTime ? formatDuration(records.bestFiveKTime) : "Not yet"}
          detail={profile.five_k_goal}
          icon={Gauge}
          tone="zinc"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Strength Progress Chart" />
          <StrengthVolumeChart data={strengthChartData(workouts)} />
        </Card>
        <Card>
          <SectionTitle title="Running / 5K Progress Chart" />
          <RunningProgressChart data={runningChartData(runs)} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <SectionTitle title="5K Goal Progress" />
          <ProgressBar value={goalProgress} label="Distance benchmark" />
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Progress is based on recent distance toward a 5K benchmark. Pace is treated as a
            personal trend, not a family comparison.
          </p>
        </Card>

        <Card>
          <SectionTitle title="Rule-Based Coaching" />
          <div className="grid gap-3 sm:grid-cols-2">
            <CoachingItem title="Strength" text={coaching.strengthSuggestion} />
            <CoachingItem title="Running" text={coaching.runningSuggestion} />
            <CoachingItem title="Habits" text={coaching.habitSuggestion} />
            <CoachingItem title="Goals" text={coaching.goalAdjustment} />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Personal Records" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="py-3">Exercise</th>
                <th>Highest weight</th>
                <th>Highest est. 1RM</th>
                <th>Most bodyweight reps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {records.exercises.map((record) => (
                <tr key={record.exerciseName}>
                  <td className="py-3 font-medium">{record.exerciseName}</td>
                  <td>{record.highestWeight} kg</td>
                  <td>{record.highestEstimatedOneRepMax} kg</td>
                  <td>{record.mostBodyweightReps || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

function CoachingItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-4">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  );
}
