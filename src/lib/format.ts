import type { HomelessUser, MainNeed, RiskLevel } from "@/lib/types";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function riskBadgeClass(risk: RiskLevel) {
  if (risk === "เร่งด่วน") return "border-red-200 bg-red-50 text-red-700";
  if (risk === "สูง") return "border-orange-200 bg-orange-50 text-orange-700";
  if (risk === "ปานกลาง") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function needBadgeClass(need: MainNeed) {
  const map: Record<MainNeed, string> = {
    สุขภาพ: "border-sky-200 bg-sky-50 text-sky-700",
    ที่พัก: "border-violet-200 bg-violet-50 text-violet-700",
    "เอกสาร/สิทธิ": "border-teal-200 bg-teal-50 text-teal-700",
    "งาน/รายได้": "border-lime-200 bg-lime-50 text-lime-700",
    สุขภาพใจ: "border-pink-200 bg-pink-50 text-pink-700",
    "อาหาร/ของใช้จำเป็น": "border-slate-200 bg-slate-50 text-slate-700",
  };
  return map[need];
}

export function recommendedAction(user: HomelessUser) {
  if (user.riskLevel === "เร่งด่วน" && user.shelterNeed) {
    return "ประสานที่พักชั่วคราวภายในวันนี้";
  }
  if (user.healthNeed) return "นัดหมายตรวจสุขภาพเบื้องต้น";
  if (user.documentNeed) return "ช่วยตรวจสอบสิทธิและเอกสารสำคัญ";
  if (user.employmentReadiness === "พร้อมเริ่มงาน") {
    return "ประเมินความพร้อมก่อนเข้าสู่งานรายวัน";
  }
  if (user.mentalHealthNeed) return "ประสานทีมให้คำปรึกษาและติดตามสภาพใจ";
  return "ติดตามความต้องการและยืนยันแผนช่วยเหลือครั้งถัดไป";
}
