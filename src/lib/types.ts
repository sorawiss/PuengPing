export type Gender = "ชาย" | "หญิง" | "ไม่ระบุ" | "อื่น ๆ";

export type AreaType =
  | "สถานีรถไฟ"
  | "ใต้สะพาน"
  | "ตลาด"
  | "สวนสาธารณะ"
  | "ศูนย์พักพิง"
  | "ชุมชนเมือง"
  | "อื่น ๆ";

export type MainNeed =
  | "สุขภาพ"
  | "ที่พัก"
  | "เอกสาร/สิทธิ"
  | "งาน/รายได้"
  | "สุขภาพใจ"
  | "อาหาร/ของใช้จำเป็น";

export type RiskLevel = "ต่ำ" | "ปานกลาง" | "สูง" | "เร่งด่วน";

export type ShelterStatus =
  | "มีที่พักชั่วคราว"
  | "ไม่มีที่พักคืนนี้"
  | "อยู่ระหว่างประสาน"
  | "ปฏิเสธที่พัก"
  | "ไม่ทราบ";

export type WelfareStatus =
  | "พร้อม"
  | "ขาดเอกสาร"
  | "รอตรวจสอบสิทธิ"
  | "ไม่ทราบสิทธิ"
  | "อยู่ระหว่างดำเนินการ";

export type EmploymentReadiness =
  | "ยังไม่พร้อม"
  | "ต้องฟื้นฟูก่อน"
  | "พร้อมบางส่วน"
  | "พร้อมเริ่มงาน";

export type FollowUpStatus =
  | "ยังไม่เริ่ม"
  | "ต้องติดตาม"
  | "นัดหมายแล้ว"
  | "ส่งต่อแล้ว"
  | "เสร็จสิ้นบางส่วน";

export type ReferralStatus =
  | "รอดำเนินการ"
  | "นัดหมายแล้ว"
  | "ส่งต่อแล้ว"
  | "เสร็จสิ้น"
  | "ติดตามต่อ";

export type Referral = {
  date: string;
  service: string;
  organization: string;
  status: ReferralStatus;
  note: string;
};

export type HomelessUser = {
  id: string;
  careKeyId: string;
  nickname: string;
  age: number;
  gender: Gender;
  area: string;
  areaType: AreaType;
  homelessDuration: string;
  mainReason: string;
  mainNeed: MainNeed;
  riskLevel: RiskLevel;
  shelterStatus: ShelterStatus;
  healthNeed: boolean;
  mentalHealthNeed: boolean;
  documentNeed: boolean;
  employmentNeed: boolean;
  shelterNeed: boolean;
  foodNeed: boolean;
  welfareStatus: WelfareStatus;
  employmentReadiness: EmploymentReadiness;
  followUpStatus: FollowUpStatus;
  assignedWorker: string;
  lastContactDate: string;
  notes: string;
  referrals: Referral[];
};
