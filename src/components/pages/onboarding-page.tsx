"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { Card, Input, PrimaryButton, SectionTitle, Select } from "@/components/ui";
import { gymLevels, mainGoals, runningLevels, workoutSplits, WorkoutSplit } from "@/lib/types";

export function OnboardingPage() {
  const router = useRouter();
  const { profile, updateOnboarding } = useFitQuest();
  const [form, setForm] = useState({
    name: profile.name,
    nickname: profile.nickname,
    main_goal: profile.main_goal,
    age: profile.age,
    body_weight_kg: profile.body_weight_kg,
    gym_level: profile.gym_level,
    running_level: profile.running_level,
    five_k_goal: profile.five_k_goal,
    calorie_target: profile.calorie_target,
    protein_target: profile.protein_target,
    water_target: profile.water_target,
    alcohol_goal: profile.alcohol_goal,
    workout_split: profile.workout_split,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateOnboarding(form);
    router.push("/dashboard");
  }

  function toggleSplit(split: WorkoutSplit) {
    setForm((previous) => {
      const hasSplit = previous.workout_split.includes(split);
      const workout_split = hasSplit
        ? previous.workout_split.filter((item) => item !== split)
        : [...previous.workout_split, split];
      return { ...previous, workout_split: workout_split.length ? workout_split : [split] };
    });
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Onboarding
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Set your starting point</h1>
      </div>

      <Card>
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionTitle title="Profile" />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Name</span>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Role / nickname</span>
              <Input
                value={form.nickname}
                onChange={(event) => setForm({ ...form, nickname: event.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Main goal</span>
              <Select
                value={form.main_goal}
                onChange={(event) => setForm({ ...form, main_goal: event.target.value as typeof form.main_goal })}
              >
                {mainGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </Select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Age</span>
                <Input
                  type="number"
                  min="12"
                  value={form.age}
                  onChange={(event) => setForm({ ...form, age: Number(event.target.value) })}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Bodyweight kg</span>
                <Input
                  type="number"
                  min="30"
                  step="0.1"
                  value={form.body_weight_kg}
                  onChange={(event) =>
                    setForm({ ...form, body_weight_kg: Number(event.target.value) })
                  }
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Gym level</span>
              <Select
                value={form.gym_level}
                onChange={(event) => setForm({ ...form, gym_level: event.target.value as typeof form.gym_level })}
              >
                {gymLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Current running level</span>
              <Select
                value={form.running_level}
                onChange={(event) =>
                  setForm({ ...form, running_level: event.target.value as typeof form.running_level })
                }
              >
                {runningLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">5K goal</span>
              <Input
                value={form.five_k_goal}
                onChange={(event) => setForm({ ...form, five_k_goal: event.target.value })}
              />
            </label>
          </div>

          <div className="space-y-4">
            <SectionTitle title="Targets" />
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Calories</span>
                <Input
                  type="number"
                  value={form.calorie_target}
                  onChange={(event) =>
                    setForm({ ...form, calorie_target: Number(event.target.value) })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Protein g</span>
                <Input
                  type="number"
                  value={form.protein_target}
                  onChange={(event) =>
                    setForm({ ...form, protein_target: Number(event.target.value) })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Water L</span>
                <Input
                  type="number"
                  step="0.1"
                  value={form.water_target}
                  onChange={(event) =>
                    setForm({ ...form, water_target: Number(event.target.value) })
                  }
                />
              </label>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
              <span>
                <span className="block text-sm font-semibold">Alcohol-free day goal</span>
                <span className="block text-sm text-zinc-500">Reward recovery consistency.</span>
              </span>
              <input
                type="checkbox"
                checked={form.alcohol_goal}
                onChange={(event) => setForm({ ...form, alcohol_goal: event.target.checked })}
                className="h-5 w-5 accent-emerald-600"
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700">Preferred workout split</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {workoutSplits.map((split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => toggleSplit(split)}
                    className={`rounded-lg border p-4 text-left text-sm font-semibold ${
                      form.workout_split.includes(split)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    {split}
                  </button>
                ))}
              </div>
            </div>

            <PrimaryButton type="submit" className="w-full">
              Save onboarding
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
