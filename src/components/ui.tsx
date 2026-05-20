import {
  Award,
  BadgeCheck,
  Dumbbell,
  Flame,
  Footprints,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeIcons: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  Dumbbell,
  Flame,
  Footprints,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Flag: Award,
};

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/50",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "emerald" | "amber" | "rose" | "zinc";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  };

  return (
    <Card className="min-h-[132px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2 ring-1", tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{detail}</p>
    </Card>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
}: {
  value: number;
  max?: number;
  label?: string;
}) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700">{label}</span>
          <span className="text-zinc-500">{Math.round(width)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function BadgePill({ icon, label }: { icon: string; label: string }) {
  const Icon = badgeIcons[icon] ?? Award;
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium leading-5 text-zinc-800">{label}</span>
    </div>
  );
}

export function SectionTitle({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-zinc-950">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none ring-emerald-500 transition placeholder:text-zinc-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none ring-emerald-500 transition focus:ring-2",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none ring-emerald-500 transition placeholder:text-zinc-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
