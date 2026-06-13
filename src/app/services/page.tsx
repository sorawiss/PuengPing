import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/priority-list";
import { homelessUsers } from "@/data/homeless-users";
import { needBadgeClass, riskBadgeClass } from "@/lib/format";
import type { MainNeed } from "@/lib/types";

const serviceGroups: Array<{ need: MainNeed; title: string; description: string }> = [
  { need: "สุขภาพ", title: "สุขภาพ", description: "ผู้ใช้บริการที่ควรได้รับการตรวจ ประเมิน หรือส่งต่อคลินิกชุมชน" },
  { need: "ที่พัก", title: "ที่พัก", description: "รายการที่ต้องประสานที่พักชั่วคราวหรือพื้นที่ปลอดภัย" },
  { need: "เอกสาร/สิทธิ", title: "เอกสารและสวัสดิการ", description: "รายการที่ต้องตรวจสอบเอกสาร สิทธิรักษา หรือสวัสดิการพื้นฐาน" },
  { need: "งาน/รายได้", title: "การจ้างงาน", description: "ผู้ใช้บริการที่เริ่มประเมินความพร้อมด้านงานและรายได้" },
  { need: "สุขภาพใจ", title: "สุขภาพใจ/สังคม", description: "รายการที่ควรติดตามด้านสภาพใจ ความสัมพันธ์ หรือการสนับสนุนทางสังคม" },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        subtitle="จัดกลุ่มผู้ใช้บริการตามความต้องการ เพื่อช่วยทีมภาคสนามวางแผนส่งต่อได้เร็วขึ้น"
        title="ความต้องการบริการ"
      />

      <div className="mt-6 space-y-6">
        {serviceGroups.map((group) => {
          const users = homelessUsers.filter(
            (user) =>
              user.mainNeed === group.need ||
              (group.need === "สุขภาพ" && user.healthNeed) ||
              (group.need === "ที่พัก" && user.shelterNeed) ||
              (group.need === "เอกสาร/สิทธิ" && user.documentNeed) ||
              (group.need === "งาน/รายได้" && user.employmentNeed) ||
              (group.need === "สุขภาพใจ" && user.mentalHealthNeed),
          );

          return (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={group.need}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{group.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{group.description}</p>
                </div>
                <Badge className={needBadgeClass(group.need)}>{users.length} ราย</Badge>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {users.slice(0, 9).map((user) => (
                  <Link className="rounded-md border border-slate-200 p-4 transition hover:bg-slate-50" href={`/people/${user.id}`} key={user.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{user.nickname}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {user.careKeyId} · {user.area}
                        </p>
                      </div>
                      <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{user.followUpStatus}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
