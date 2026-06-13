import { AiMatchPanel } from "@/components/ai-match-panel";
import { DashboardHeader } from "@/components/dashboard-header";

export default function AiPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DashboardHeader
        subtitle="ถามด้วยภาษาธรรมชาติ แล้วให้ Typhoon AI ช่วยดูข้อมูลทักษะ สุขภาพ อายุ ความพร้อม และข้อจำกัดจากข้อมูลจำลอง"
        title="ถาม AI เพื่อจับคู่งาน"
      />
      <div className="mt-6">
        <AiMatchPanel />
      </div>
    </main>
  );
}
