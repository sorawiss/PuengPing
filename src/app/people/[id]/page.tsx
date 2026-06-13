import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/priority-list";
import { ReferralTimeline } from "@/components/referral-timeline";
import { homelessUsers } from "@/data/homeless-users";
import { needBadgeClass, recommendedAction, riskBadgeClass } from "@/lib/format";

export function generateStaticParams() {
  return homelessUsers.map((user) => ({ id: user.id }));
}

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = homelessUsers.find((item) => item.id === id);
  if (!user) notFound();

  const statuses = [
    ["สุขภาพ", user.healthNeed ? "ต้องประสานบริการ" : "ไม่มีรายการเร่งด่วน"],
    ["ที่พัก", user.shelterStatus],
    ["เอกสาร/สิทธิ", user.welfareStatus],
    ["การจ้างงาน", user.employmentReadiness],
    ["ติดตาม", user.followUpStatus],
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        action={
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
            href="/people"
          >
            กลับไปหน้ารายชื่อ
          </Link>
        }
        subtitle={`${user.careKeyId} · ${user.area} · ผู้ดูแล ${user.assignedWorker}`}
        title={user.nickname}
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
              <Badge className={needBadgeClass(user.mainNeed)}>{user.mainNeed}</Badge>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Info label="อายุ" value={`${user.age} ปี`} />
              <Info label="เพศ" value={user.gender} />
              <Info label="พื้นที่พบ" value={user.area} />
              <Info label="ลักษณะพื้นที่" value={user.areaType} />
              <Info label="เปิดเคส" value={user.caseOpenedDate} />
              <Info label="ติดต่อล่าสุด" value={user.lastContactDate} />
              <Info label="ระยะเวลาไร้ที่พัก" value={user.homelessDuration} />
              <Info label="จุดที่ติดต่อได้" value={user.contactPoint} />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">สถานะสำคัญ</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {statuses.map(([label, value]) => (
                <div className="rounded-md border border-slate-200 p-4" key={label}>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">ข้อมูลสุขภาพและข้อจำกัด</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <TextBlock label="สภาพร่างกาย" value={user.physicalCondition} />
              <TextBlock label="สรุปสุขภาพ" value={user.healthSummary} />
              <TextBlock label="ข้อจำกัดในการทำงาน" value={user.workConstraints} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">ข้อมูลสำหรับจับคู่งานและ AI Search</h2>
            <div className="mt-4 space-y-5">
              <ChipGroup label="ทักษะ" values={user.skills} />
              <ChipGroup label="ประสบการณ์ทำงาน" values={user.workExperience} />
              <ChipGroup label="งานที่สนใจ" values={user.employmentPreference} />
              <TextBlock label="เวลาที่พร้อม" value={user.availability} />
              <ChipGroup label="คำค้นสำหรับ AI" values={user.aiSearchTags} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">บันทึกเจ้าหน้าที่</h2>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <TextBlock label="เหตุผลหลักของภาวะไร้ที่พัก" value={user.mainReason} />
              <TextBlock label="เอกสาร/สิทธิ" value={user.documentSummary} />
              <TextBlock label="เครือข่ายสนับสนุน" value={user.socialSupportSummary} />
              <TextBlock label="ข้อสังเกตจากทีมภาคสนาม" value={user.officerObservation} />
              <TextBlock label="สรุปเคสสำหรับประสานงาน" value={user.caseSummary} />
            </div>
          </section>

          <section className="rounded-lg border border-[var(--ci-green)] bg-emerald-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">คำแนะนำขั้นถัดไป</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900">{recommendedAction(user)}</p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">ประวัติการส่งต่อบริการ</h2>
            <div className="mt-4">
              <ReferralTimeline referrals={user.referrals} />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}

function ChipGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
