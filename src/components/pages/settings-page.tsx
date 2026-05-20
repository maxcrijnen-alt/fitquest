"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { advancedUserId, fatherUserId } from "@/lib/demo-data";
import { Card, Input, PrimaryButton, SecondaryButton, Select } from "@/components/ui";
import { gymLevels, mainGoals, runningLevels } from "@/lib/types";

export function SettingsPage() {
  const { profile, updateOnboarding, switchDemoUser, supabaseReady } = useFitQuest();
  const [form, setForm] = useState(profile);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateOnboarding(form);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Profile and goals</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Name</span>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Nickname</span>
              <Input
                value={form.nickname}
                onChange={(event) => setForm({ ...form, nickname: event.target.value })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Main goal</span>
              <Select
                value={form.main_goal}
                onChange={(event) => setForm({ ...form, main_goal: event.target.value as typeof form.main_goal })}
              >
                {mainGoals.map((goal) => (
                  <option key={goal}>{goal}</option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Age</span>
              <Input
                type="number"
                min="12"
                value={form.age}
                onChange={(event) => setForm({ ...form, age: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Bodyweight kg</span>
              <Input
                type="number"
                min="30"
                step="0.1"
                value={form.body_weight_kg}
                onChange={(event) => setForm({ ...form, body_weight_kg: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Gym level</span>
              <Select
                value={form.gym_level}
                onChange={(event) => setForm({ ...form, gym_level: event.target.value as typeof form.gym_level })}
              >
                {gymLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Running level</span>
              <Select
                value={form.running_level}
                onChange={(event) =>
                  setForm({ ...form, running_level: event.target.value as typeof form.running_level })
                }
              >
                {runningLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">5K goal</span>
              <Input
                value={form.five_k_goal}
                onChange={(event) => setForm({ ...form, five_k_goal: event.target.value })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Calories</span>
              <Input
                type="number"
                value={form.calorie_target}
                onChange={(event) => setForm({ ...form, calorie_target: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Protein g</span>
              <Input
                type="number"
                value={form.protein_target}
                onChange={(event) => setForm({ ...form, protein_target: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Water L</span>
              <Input
                type="number"
                step="0.1"
                value={form.water_target}
                onChange={(event) => setForm({ ...form, water_target: Number(event.target.value) })}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
              <span className="text-sm font-semibold">Alcohol-free goal</span>
              <input
                type="checkbox"
                checked={form.alcohol_goal}
                onChange={(event) => setForm({ ...form, alcohol_goal: event.target.checked })}
                className="h-5 w-5 accent-emerald-600"
              />
            </label>
            <PrimaryButton type="submit" className="sm:col-span-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              Save profile
            </PrimaryButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Account</h2>
          <div className="mt-4 rounded-lg bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">Storage mode</p>
            <p className="mt-1 font-semibold">{supabaseReady ? "Supabase" : "Local demo"}</p>
          </div>
          {!supabaseReady ? (
            <div className="mt-5 grid gap-3">
              <SecondaryButton type="button" onClick={() => switchDemoUser(advancedUserId)}>
                Switch to Max
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => switchDemoUser(fatherUserId)}>
                Switch to Father
              </SecondaryButton>
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
