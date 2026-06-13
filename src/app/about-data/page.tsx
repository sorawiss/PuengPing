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
      <h1>ข้อมูลทั้งหมดเป็นเพียงข้อมูลจำลอง</h1>
    </main>
  );
}
