import type { Referral } from "@/lib/types";

export function ReferralTimeline({ referrals }: { referrals: Referral[] }) {
  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <article className="border-l-2 border-[var(--ci-blue)] pl-4" key={`${referral.date}-${referral.service}`}>
          <time className="text-sm font-semibold text-[var(--ci-blue)]">{referral.date}</time>
          <h3 className="mt-1 font-semibold text-slate-950">{referral.service}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {referral.organization} · {referral.status}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{referral.note}</p>
        </article>
      ))}
    </div>
  );
}
