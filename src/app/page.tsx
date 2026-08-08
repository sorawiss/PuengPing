import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { PriorityList } from "@/components/priority-list";
import { StatCard } from "@/components/stat-card";
import {
  getEmploymentReadyUsers,
  getRecentReferrals,
  getTotalUsers,
  getUrgentUsers,
  getUsersByMainNeed,
  getUsersByRiskLevel,
  getUsersNeedingHealthSupport,
  getUsersNeedingShelter,
  getUsersWithDocumentIssues,
} from "@/lib/mock-utils";
import { OverviewChart } from "@/components/overview-chart";
import { NeedsChart } from "@/components/needs-chart";
import { RiskChart } from "@/components/risk-chart";

export default function Home() {
  const needCounts = getUsersByMainNeed();
  const riskCounts = getUsersByRiskLevel();
  const recentReferrals = getRecentReferrals();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        action={
          <div className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            อัปเดตล่าสุด 13 มิ.ย. 2569
          </div>
        }
        subtitle="ระบบช่วยติดตามและเชื่อมต่อบริการสำหรับผู้ใช้บริการคนไร้บ้าน"
        title="puengping Dashboard"
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard detail="ข้อมูลจำลองสำหรับสาธิตระบบ" href="/people" label="จำนวนผู้ใช้บริการทั้งหมด" value={getTotalUsers()} />
        <StatCard detail="ควรประสานที่พักหรือพื้นที่ปลอดภัย" href="/services" label="ต้องการที่พักคืนนี้" value={getUsersNeedingShelter().length} />
        <StatCard detail="ต้องประสานบริการสุขภาพเบื้องต้น" href="/services" label="ต้องการดูแลสุขภาพ" value={getUsersNeedingHealthSupport().length} />
        <StatCard detail="ต้องตรวจสอบเอกสารหรือสิทธิสวัสดิการ" href="/services" label="เอกสาร/สิทธิยังไม่พร้อม" value={getUsersWithDocumentIssues().length} />
        <StatCard detail="พร้อมเริ่มงานหรือเข้าสู่รายได้ระยะสั้น" href="/services" label="พร้อมเข้าสู่การจ้างงาน" value={getEmploymentReadyUsers().length} />
        <StatCard detail="ควรติดตามก่อนรายการอื่น" href="/people" label="ต้องติดตามเร่งด่วน" value={getUrgentUsers().length} />
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">แนวโน้มผู้เข้ารับบริการ (พ.ศ. 2569)</h2>
        <OverviewChart />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PriorityList users={getUrgentUsers()} />

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">สรุปความต้องการบริการ</h2>
            <NeedsChart data={needCounts} />
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">ระดับความเร่งด่วน</h2>
            <div className="mt-4">
              <RiskChart data={riskCounts} />
            </div>
          </section>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950">กิจกรรมล่าสุด</h2>
          <Link className="text-sm font-semibold text-[var(--ci-blue)]" href="/people">
            เปิดรายชื่อ
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recentReferrals.map((item) => (
            <article className="rounded-md border border-slate-200 p-4" key={`${item.userId}-${item.date}-${item.service}`}>
              <p className="text-sm font-semibold text-slate-950">
                {item.service} · {item.nickname}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {item.organization} · {item.status}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
