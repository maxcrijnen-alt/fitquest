"use client";

import { FormEvent, useState } from "react";
import { Coins, Gift, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useFitQuest } from "@/components/app-provider";
import { BadgePill, Card, Input, PrimaryButton, SecondaryButton, Textarea } from "@/components/ui";
import { getEarnedBadges } from "@/lib/fitness";

export function RewardsPage() {
  const { state, profile, createReward, purchaseReward } = useFitQuest();
  const [title, setTitle] = useState("Coffee together");
  const [description, setDescription] = useState("A simple shared reward after a consistent week.");
  const [coinCost, setCoinCost] = useState(80);
  const badges = getEarnedBadges(state, profile.id);
  const rewards = state.rewards.filter((reward) => reward.user_id === profile.id);
  const purchases = state.rewardPurchases.filter((purchase) => purchase.user_id === profile.id);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createReward({ title, description, coin_cost: coinCost });
    setTitle("");
    setDescription("");
    setCoinCost(50);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Rewards and badges
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Rewards shop</h1>
        </div>
        <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-900">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Coins className="h-4 w-4" aria-hidden="true" />
            {profile.coins} coins
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-semibold">Create reward</h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Title</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Description</span>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Coin cost</span>
              <Input
                type="number"
                min="1"
                value={coinCost}
                onChange={(event) => setCoinCost(Number(event.target.value))}
              />
            </label>
            <PrimaryButton type="submit">
              <Gift className="h-4 w-4" aria-hidden="true" />
              Add reward
            </PrimaryButton>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Available rewards</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {rewards.map((reward) => {
              const purchased = purchases.some((purchase) => purchase.reward_id === reward.id);
              return (
                <div key={reward.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{reward.title}</p>
                      <p className="mt-1 text-sm leading-5 text-zinc-600">{reward.description}</p>
                    </div>
                    <ShoppingBag className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-amber-700">{reward.coin_cost} coins</span>
                    <SecondaryButton
                      type="button"
                      disabled={purchased || reward.coin_cost > profile.coins}
                      onClick={() => purchaseReward(reward.id)}
                    >
                      {purchased ? "Purchased" : "Buy"}
                    </SecondaryButton>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold">Earned badges</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <BadgePill key={badge.id} icon={badge.icon} label={badge.name} />
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
