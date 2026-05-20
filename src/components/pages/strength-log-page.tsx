"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { Card, Input, PrimaryButton, SecondaryButton, Select, Textarea } from "@/components/ui";
import { calculateWorkoutVolume, estimatedOneRepMax, todayISO } from "@/lib/fitness";
import { workoutSplits, type WorkoutSplit } from "@/lib/types";

type ExerciseDraft = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  is_bodyweight: boolean;
  notes: string;
};

const starterExercises: ExerciseDraft[] = [
  { exercise_name: "Bench press", sets: 3, reps: 8, weight: 60, is_bodyweight: false, notes: "" },
  { exercise_name: "Incline dumbbell press", sets: 3, reps: 10, weight: 22.5, is_bodyweight: false, notes: "" },
  { exercise_name: "Triceps pressdown", sets: 3, reps: 12, weight: 25, is_bodyweight: false, notes: "" },
];

export function StrengthLogPage() {
  const router = useRouter();
  const { addStrengthWorkout, profile } = useFitQuest();
  const [workoutDate, setWorkoutDate] = useState(todayISO());
  const [splitType, setSplitType] = useState<WorkoutSplit>(profile.workout_split[0]);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState(starterExercises);

  const computedExercises = useMemo(
    () =>
      exercises.map((exercise) => ({
        ...exercise,
        estimated_1rm: exercise.is_bodyweight ? 0 : estimatedOneRepMax(exercise.weight, exercise.reps),
      })),
    [exercises],
  );
  const totalVolume = calculateWorkoutVolume(
    computedExercises.map((exercise, index) => ({
      ...exercise,
      id: String(index),
      workout_id: "draft",
    })),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addStrengthWorkout({
      workout_date: workoutDate,
      split_type: splitType,
      notes,
      exercises,
    });
    router.push("/dashboard");
  }

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((previous) =>
      previous.map((exercise, itemIndex) => (itemIndex === index ? { ...exercise, ...patch } : exercise)),
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Strength tracking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Log strength workout</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Date</span>
              <Input type="date" value={workoutDate} onChange={(event) => setWorkoutDate(event.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Split</span>
              <Select value={splitType} onChange={(event) => setSplitType(event.target.value as WorkoutSplit)}>
                {workoutSplits.map((split) => (
                  <option key={split} value={split}>
                    {split}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Total volume</span>
              <Input value={`${totalVolume.toLocaleString()} kg`} readOnly />
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="grid gap-3 lg:grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr_0.7fr_auto]">
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Exercise
                    </span>
                    <Input
                      value={exercise.exercise_name}
                      onChange={(event) => updateExercise(index, { exercise_name: event.target.value })}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Sets
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(event) => updateExercise(index, { sets: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Reps
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(event) => updateExercise(index, { reps: Number(event.target.value) })}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Weight
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight}
                      onChange={(event) => updateExercise(index, { weight: Number(event.target.value) })}
                      disabled={exercise.is_bodyweight}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Est. 1RM
                    </span>
                    <Input value={`${computedExercises[index].estimated_1rm} kg`} readOnly />
                  </label>
                  <button
                    type="button"
                    onClick={() => setExercises((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                    className="mt-6 flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100"
                    title="Remove exercise"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr]">
                  <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-200">
                    <input
                      type="checkbox"
                      checked={exercise.is_bodyweight}
                      onChange={(event) =>
                        updateExercise(index, {
                          is_bodyweight: event.target.checked,
                          weight: event.target.checked ? 0 : exercise.weight,
                        })
                      }
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm font-medium">Bodyweight</span>
                  </label>
                  <Input
                    placeholder="Notes"
                    value={exercise.notes}
                    onChange={(event) => updateExercise(index, { notes: event.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SecondaryButton
              type="button"
              onClick={() =>
                setExercises((previous) => [
                  ...previous,
                  { exercise_name: "", sets: 3, reps: 10, weight: 0, is_bodyweight: false, notes: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add exercise
            </SecondaryButton>
            <PrimaryButton type="submit">Save workout</PrimaryButton>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Workout notes</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Strength PRs are calculated from highest weight, estimated 1RM, bodyweight reps,
            and total workout volume.
          </p>
          <Textarea className="mt-4" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            Est. 1RM uses: weight x (1 + reps / 30).
          </div>
        </Card>
      </form>
    </AppShell>
  );
}
