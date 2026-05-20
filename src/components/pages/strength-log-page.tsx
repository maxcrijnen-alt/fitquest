"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, RotateCcw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { Card, Input, PrimaryButton, ProgressBar, SecondaryButton, Select, Textarea } from "@/components/ui";
import {
  calculateStrengthBodyPartImpact,
  calculateWorkoutVolume,
  estimatedOneRepMax,
  exerciseStrengthFactor,
  getStrengthWorkouts,
  getWorkoutExercises,
  inferExerciseBodyParts,
  todayISO,
  weightedExerciseStrength,
} from "@/lib/fitness";
import { workoutSplits, type AvatarBodyPartScores, type WorkoutSplit } from "@/lib/types";

type ExerciseDraft = {
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  is_bodyweight: boolean;
  notes: string;
};

const splitExerciseTemplates: Record<WorkoutSplit, ExerciseDraft[]> = {
  "Chest + triceps": [
    { exercise_name: "Bench press", sets: 3, reps: 8, weight: 60, is_bodyweight: false, notes: "" },
    { exercise_name: "Incline dumbbell press", sets: 3, reps: 10, weight: 22.5, is_bodyweight: false, notes: "" },
    { exercise_name: "Cable fly", sets: 3, reps: 12, weight: 15, is_bodyweight: false, notes: "" },
    { exercise_name: "Triceps pressdown", sets: 3, reps: 12, weight: 25, is_bodyweight: false, notes: "" },
  ],
  "Back + biceps": [
    { exercise_name: "Barbell row", sets: 3, reps: 8, weight: 60, is_bodyweight: false, notes: "" },
    { exercise_name: "Lat pulldown", sets: 3, reps: 10, weight: 55, is_bodyweight: false, notes: "" },
    { exercise_name: "Seated cable row", sets: 3, reps: 10, weight: 50, is_bodyweight: false, notes: "" },
    { exercise_name: "Dumbbell curl", sets: 3, reps: 12, weight: 12, is_bodyweight: false, notes: "" },
  ],
  Legs: [
    { exercise_name: "Back squat", sets: 3, reps: 8, weight: 70, is_bodyweight: false, notes: "" },
    { exercise_name: "Leg press", sets: 3, reps: 10, weight: 120, is_bodyweight: false, notes: "" },
    { exercise_name: "Romanian deadlift", sets: 3, reps: 8, weight: 70, is_bodyweight: false, notes: "" },
    { exercise_name: "Calf raise", sets: 3, reps: 12, weight: 40, is_bodyweight: false, notes: "" },
  ],
};

const bodyPartLabels: { key: keyof AvatarBodyPartScores; label: string }[] = [
  { key: "chest", label: "Chest" },
  { key: "triceps", label: "Triceps" },
  { key: "back", label: "Back" },
  { key: "biceps", label: "Biceps" },
  { key: "legs", label: "Legs" },
];

export function StrengthLogPage() {
  const router = useRouter();
  const { addStrengthWorkout, profile, state } = useFitQuest();
  const defaultSplit = profile.workout_split[0] ?? "Chest + triceps";
  const [workoutDate, setWorkoutDate] = useState(todayISO());
  const [splitType, setSplitType] = useState<WorkoutSplit>(defaultSplit);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => cloneDrafts(splitExerciseTemplates[defaultSplit]));

  const workouts = getStrengthWorkouts(state, profile.id);
  const lastWorkoutForSplit = [...workouts].reverse().find((workout) => workout.split_type === splitType);
  const recentExercises = useMemo(() => buildRecentExercises(state, profile.id), [profile.id, state]);

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
  const avatarImpact = calculateStrengthBodyPartImpact(computedExercises, splitType);

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

  function addExercise(exercise: ExerciseDraft = blankExercise()) {
    setExercises((previous) => [...previous, { ...exercise }]);
  }

  function loadTemplate() {
    setExercises(cloneDrafts(splitExerciseTemplates[splitType]));
  }

  function duplicatePreviousWorkout() {
    if (!lastWorkoutForSplit) return;
    const previousExercises = getWorkoutExercises(state, lastWorkoutForSplit.id);
    setExercises(previousExercises.map(toDraft));
    setNotes(`Repeated ${lastWorkoutForSplit.split_type} from ${lastWorkoutForSplit.workout_date}.`);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Strength tracking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Log strength workout</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]">
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

          <div className="mt-5 flex flex-wrap gap-3">
            <SecondaryButton type="button" onClick={loadTemplate}>
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Load split template
            </SecondaryButton>
            <SecondaryButton type="button" onClick={duplicatePreviousWorkout} disabled={!lastWorkoutForSplit}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicate previous
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() => setExercises((previous) => previous.map((exercise) => ({ ...exercise, weight: 0 })))}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset weights
            </SecondaryButton>
          </div>

          <div className="mt-6 space-y-4">
            {exercises.map((exercise, index) => {
              const computed = computedExercises[index];
              const targets = inferExerciseBodyParts(exercise.exercise_name, splitType);
              const strengthFactor = exercise.is_bodyweight ? 0 : exerciseStrengthFactor(exercise.exercise_name);
              const weightedStrength = exercise.is_bodyweight ? 0 : weightedExerciseStrength(computed);

              return (
                <div key={index} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.45fr_0.45fr_0.6fr_0.65fr_auto]">
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
                      <Input value={`${computed.estimated_1rm} kg`} readOnly />
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
                  <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
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
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    {targets.map((target) => (
                      <span key={target} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800">
                        {target}
                      </span>
                    ))}
                    {!exercise.is_bodyweight ? (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
                        Avatar eq. {weightedStrength} kg x {strengthFactor}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
                        Bodyweight reps grow avatar directly
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <SecondaryButton type="button" onClick={() => addExercise()}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add exercise
            </SecondaryButton>
            <PrimaryButton type="submit">Save workout</PrimaryButton>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold">Workout shortcuts</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Add recent movements or load the split template to start faster on mobile.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentExercises.length ? (
                recentExercises.map((exercise) => (
                  <button
                    key={exercise.exercise_name}
                    type="button"
                    onClick={() => addExercise(exercise)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-100"
                  >
                    {exercise.exercise_name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-zinc-500">Recent exercises will appear after your first saved workout.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold">Avatar impact</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              This preview uses weighted relative strength, so exercise type matters. Dumbbell
              and isolation movements can still grow the avatar even with lower raw kg.
            </p>
            <div className="mt-4 rounded-lg bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">Dominant gain</p>
                  <p className="mt-1 text-lg font-semibold capitalize">{avatarImpact.dominantBodyPart}</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                Weighted lift total: {avatarImpact.weightedTotal.toLocaleString()} kg
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {bodyPartLabels.map((part) => (
                <ProgressBar
                  key={part.key}
                  value={avatarImpact.bodyParts[part.key]}
                  label={part.label}
                />
              ))}
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
              Est. 1RM uses: weight x (1 + reps / 30). Avatar growth then applies exercise-type
              weighting for fairer relative strength.
            </div>
          </Card>
        </div>
      </form>
    </AppShell>
  );
}

function cloneDrafts(drafts: ExerciseDraft[]) {
  return drafts.map((draft) => ({ ...draft }));
}

function blankExercise(): ExerciseDraft {
  return { exercise_name: "", sets: 3, reps: 10, weight: 0, is_bodyweight: false, notes: "" };
}

function toDraft(exercise: ExerciseDraft): ExerciseDraft {
  return {
    exercise_name: exercise.exercise_name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    is_bodyweight: exercise.is_bodyweight,
    notes: exercise.notes,
  };
}

function buildRecentExercises(state: ReturnType<typeof useFitQuest>["state"], userId: string) {
  const recent = new Map<string, ExerciseDraft>();
  const workouts = [...getStrengthWorkouts(state, userId)].reverse();

  workouts.forEach((workout) => {
    getWorkoutExercises(state, workout.id).forEach((exercise) => {
      const key = exercise.exercise_name.trim().toLowerCase();
      if (!key || recent.has(key)) return;
      recent.set(key, toDraft(exercise));
    });
  });

  return Array.from(recent.values()).slice(0, 10);
}
