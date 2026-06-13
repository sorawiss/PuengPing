import Link from "next/link";
import { needBadgeClass, riskBadgeClass } from "@/lib/format";
import type { HomelessUser } from "@/lib/types";

export function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function PriorityList({ users }: { users: HomelessUser[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">รายการที่ควรติดตามก่อน</h2>
        <Link className="text-sm font-semibold text-[var(--ci-blue)]" href="/people">
          ดูทั้งหมด
        </Link>
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {users.map((user) => (
          <Link
            className="grid gap-3 py-4 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto]"
            href={`/people/${user.id}`}
            key={user.id}
          >
            <div>
              <p className="font-semibold text-slate-950">
                {user.nickname} <span className="text-sm font-medium text-slate-500">{user.careKeyId}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {user.area} · {user.shelterStatus}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2 sm:justify-end">
              <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
              <Badge className={needBadgeClass(user.mainNeed)}>{user.mainNeed}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
