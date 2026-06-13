import { DashboardHeader } from "@/components/dashboard-header";

const notes = [
  "ข้อมูลทั้งหมดในระบบนี้เป็นข้อมูลจำลองเพื่อใช้สาธิตแนวคิด CareKey เท่านั้น",
  "ไม่มีข้อมูลส่วนบุคคลจริง",
  "ระบบต้นแบบนี้ยังไม่เชื่อมต่อฐานข้อมูลจริง",
  "เป้าหมายคือแสดงวิธีติดตามความต้องการและประสานบริการอย่างเป็นระบบ",
];

export default function AboutDataPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        subtitle="หน้านี้ช่วยลดความเข้าใจผิดระหว่างการสาธิต โดยอธิบายขอบเขตของข้อมูลในระบบ"
        title="ข้อมูลจำลอง"
      />

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {notes.map((note) => (
            <div className="flex gap-3 rounded-md border border-slate-200 p-4" key={note}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--ci-green)]" />
              <p className="text-sm leading-6 text-slate-700">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-950">ขอบเขตต้นแบบ</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          CareKey เวอร์ชันนี้ออกแบบเพื่อการนำเสนอในแฮกกาธอน จึงไม่รวมระบบยืนยันตัวตนจริง
          ไม่เชื่อมต่อเลขประจำตัวประชาชน โรงพยาบาล หน่วยงานสวัสดิการ หรือฐานข้อมูลภายนอก
        </p>
      </section>
    </main>
  );
}
