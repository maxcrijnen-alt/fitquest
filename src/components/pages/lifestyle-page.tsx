"use client";

import { FormEvent, useState } from "react";
import { Salad } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { Card, Input, PrimaryButton, ProgressBar } from "@/components/ui";
import { getLifestyleLogs, lifestyleHabitSummary, todayISO } from "@/lib/fitness";

export function LifestylePage() {
  const { profile, state, addLifestyleLog } = useFitQuest();
  const [logDate, setLogDate] = useState(todayISO());
  const [calories, setCalories] = useState(profile.calorie_target);
  const [protein, setProtein] = useState(profile.protein_target);
  const [water, setWater] = useState(profile.water_target);
  const [alcoholFree, setAlcoholFree] = useState(true);
  const logs = getLifestyleLogs(state, profile.id);
  const summary = lifestyleHabitSummary(profile, logs);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addLifestyleLog({
      log_date: logDate,
      calories,
      protein,
      water_liters: water,
      alcohol_free: alcoholFree,
    });
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Lifestyle tracking
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Daily lifestyle tracker</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Date</span>
              <Input type="date" value={logDate} onChange={(event) => setLogDate(event.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Calories</span>
              <Input type="number" value={calories} onChange={(event) => setCalories(Number(event.target.value))} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Protein g</span>
              <Input type="number" value={protein} onChange={(event) => setProtein(Number(event.target.value))} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-zinc-700">Water liters</span>
              <Input
                type="number"
                step="0.1"
                value={water}
                onChange={(event) => setWater(Number(event.target.value))}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 sm:col-span-2">
              <span>
                <span className="block text-sm font-semibold">Alcohol-free day</span>
                <span className="block text-sm text-zinc-500">Used for your own rewards and streaks only.</span>
              </span>
              <input
                type="checkbox"
                checked={alcoholFree}
                onChange={(event) => setAlcoholFree(event.target.checked)}
                className="h-5 w-5 accent-emerald-600"
              />
            </label>
            <PrimaryButton type="submit" className="sm:col-span-2">
              <Salad className="h-4 w-4" aria-hidden="true" />
              Save lifestyle log
            </PrimaryButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Weekly habit summary</h2>
          <div className="mt-5 space-y-5">
            <ProgressBar value={summary.protein} label="Protein target" />
            <ProgressBar value={summary.water} label="Water target" />
            <ProgressBar value={summary.calories} label="Calorie range" />
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Alcohol-free days</p>
              <p className="mt-1 text-2xl font-semibold">{summary.alcoholFreeDays} / 7</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Recent lifestyle logs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="py-3">Date</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Water</th>
                <th>Alcohol-free</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {logs.slice(-8).reverse().map((log) => (
                <tr key={log.id}>
                  <td className="py-3 font-medium">{log.log_date}</td>
                  <td>{log.calories}</td>
                  <td>{log.protein} g</td>
                  <td>{log.water_liters} L</td>
                  <td>{log.alcohol_free ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
