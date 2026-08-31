import Link from "next/link";
import { TIERS } from "@/lib/tiers";

const STEPS = [
  {
    title: "Join at the entry price",
    desc: "Sign up and start at the Starter tier — no commitment shock.",
  },
  {
    title: "Check in every visit — GPS + QR at reception, 5 seconds",
    desc: "Scan the tablet when you arrive. That's it.",
  },
  {
    title: "Watch your price drop next month",
    desc: "The more you show up, the less you pay.",
  },
];

export default function OnboardingPage() {
  return (
    <main className="app-shell flex flex-col justify-center gap-3 px-5 py-4">
      <div>
        <div className="text-lg font-bold tracking-tight">GymFlex</div>
        <div className="text-xs text-neutral-500">
          Attendance-based membership pricing
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold leading-tight">
          Work out more.
          <br />
          <span className="bg-gradient-to-r from-[#dc2626] via-[#d97706] to-[#ca8a04] bg-clip-text text-transparent">
            Pay less.
          </span>
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          The more you visit, the less you pay — automatically.
        </p>
      </div>

      <ol className="flex flex-col gap-1.5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-neutral-300">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium leading-snug">
                {step.title}
              </div>
              <div className="text-[11px] text-neutral-500">{step.desc}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-card border border-border">
        {TIERS.map((tier) => {
          const savingVsEntry = TIERS[0].priceChf - tier.priceChf;
          return (
            <div
              key={tier.name}
              className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5 last:border-b-0"
              style={{ backgroundColor: tier.bg }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tier.colour }}
                />
                <div>
                  <div className="text-sm font-semibold" style={{ color: tier.text }}>
                    {tier.name}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {tier.maxVisits === null
                      ? `${tier.minVisits}+ visits`
                      : `${tier.minVisits}–${tier.maxVisits} visits`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: tier.text }}>
                  CHF {tier.priceChf}
                </div>
                {savingVsEntry > 0 && (
                  <div className="text-[11px] text-neutral-500">
                    save {savingVsEntry}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        <Link
          href="/login"
          className="rounded-btn bg-[#4ade80] px-4 py-3 text-center text-sm font-bold text-black"
        >
          Get started →
        </Link>
        <Link
          href="/login"
          className="text-center text-xs text-neutral-500 underline underline-offset-2"
        >
          Already a member? Sign in
        </Link>
      </div>
    </main>
  );
}
