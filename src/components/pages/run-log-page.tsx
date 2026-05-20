"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { Card, Input, PrimaryButton, Textarea } from "@/components/ui";
import {
  calculatePace,
  calculatePersonalRecords,
  formatDuration,
  formatPace,
  getRuns,
  getStrengthWorkouts,
  getWorkoutExercises,
  todayISO,
} from "@/lib/fitness";

export function RunLogPage() {
  const router = useRouter();
  const { state, profile, addRun } = useFitQuest();
  const [runDate, setRunDate] = useState(todayISO());
  const [distance, setDistance] = useState(profile.running_level === "cannot run 5K yet" ? 2 : 5);
  const [time, setTime] = useState(profile.running_level === "cannot run 5K yet" ? 20 : 34);
  const [notes, setNotes] = useState("");
  const pace = useMemo(() => calculatePace(distance, time), [distance, time]);
  const runs = getRuns(state, profile.id);
  const workouts = getStrengthWorkouts(state, profile.id);
  const records = calculatePersonalRecords(
    workouts,
    workouts.flatMap((workout) => getWorkoutExercises(state, workout.id)),
    runs,
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addRun({
      run_date: runDate,
      distance_km: distance,
      time_minutes: time,
      notes,
    });
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Running tracking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Log run</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Date</span>
              <Input type="date" value={runDate} onChange={(event) => setRunDate(event.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Distance km</span>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={distance}
                onChange={(event) => setDistance(Number(event.target.value))}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Time minutes</span>
              <Input
                type="number"
                min="1"
                step="0.1"
                value={time}
                onChange={(event) => setTime(Number(event.target.value))}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Pace</span>
              <Input value={formatPace(pace)} readOnly />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">Notes</span>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>

          <PrimaryButton type="submit" className="mt-5">
            <Activity className="h-4 w-4" aria-hidden="true" />
            Save run
          </PrimaryButton>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">5K focus</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Current level</p>
              <p className="mt-1 font-semibold">{profile.running_level}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">5K goal</p>
              <p className="mt-1 font-semibold">{profile.five_k_goal}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Best 5K time</p>
              <p className="mt-1 font-semibold">
                {records.bestFiveKTime ? formatDuration(records.bestFiveKTime) : "Not logged yet"}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            {profile.running_level === "cannot run 5K yet"
              ? "Suggested next task: repeat easy run/walk intervals and add a small amount of total distance."
              : "Suggested next task: keep the next run easy and extend distance by about 0.25 km if recovery is good."}
          </div>
        </Card>
      </form>
    </AppShell>
  );
}
