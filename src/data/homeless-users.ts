import type {
  AreaType,
  EmploymentReadiness,
  FollowUpStatus,
  Gender,
  HomelessUser,
  MainNeed,
  RiskLevel,
  ShelterStatus,
  WelfareStatus,
} from "@/lib/types";

const nicknames = [
  "สมชาย",
  "น้อย",
  "แดง",
  "ป้าอร",
  "ลุงชัย",
  "มะลิ",
  "ต้น",
  "วิทย์",
  "แก้ว",
  "หนุ่ม",
  "พร",
  "เอก",
  "จอย",
  "บุญ",
  "แอน",
  "เสก",
  "ดา",
  "ป้อม",
  "แสง",
  "บี",
];

const areas = [
  "หัวลำโพง",
  "สนามหลวง",
  "อนุสาวรีย์ชัยสมรภูมิ",
  "คลองเตย",
  "บางซื่อ",
  "วงเวียนใหญ่",
  "พระราม 9",
  "สวนลุมพินี",
  "สะพานพุทธ",
  "หมอชิต",
];

const areaTypes: AreaType[] = [
  "สถานีรถไฟ",
  "สวนสาธารณะ",
  "ชุมชนเมือง",
  "ตลาด",
  "สถานีรถไฟ",
  "ใต้สะพาน",
  "ชุมชนเมือง",
  "สวนสาธารณะ",
  "ใต้สะพาน",
  "สถานีรถไฟ",
];

const reasons = [
  "รายได้ไม่พอจ่ายค่าเช่า",
  "ขาดงานประจำต่อเนื่อง",
  "ย้ายมาหางานในเมือง",
  "มีข้อจำกัดด้านสุขภาพ",
  "แยกจากครอบครัวและยังไม่มีที่อยู่ใหม่",
  "เอกสารสำคัญสูญหาย",
];

const workers = ["คุณภา", "คุณเมย์", "คุณวิน", "คุณก้อง", "คุณสา"];
const genders: Gender[] = ["ชาย", "หญิง", "ไม่ระบุ", "อื่น ๆ"];
const needs: MainNeed[] = [
  "สุขภาพ",
  "ที่พัก",
  "เอกสาร/สิทธิ",
  "งาน/รายได้",
  "สุขภาพใจ",
  "อาหาร/ของใช้จำเป็น",
];
const followUps: FollowUpStatus[] = [
  "ยังไม่เริ่ม",
  "ต้องติดตาม",
  "นัดหมายแล้ว",
  "ส่งต่อแล้ว",
  "เสร็จสิ้นบางส่วน",
];

function riskFor(index: number): RiskLevel {
  if (index % 10 === 0) return "เร่งด่วน";
  if (index % 6 === 0) return "สูง";
  if (index % 3 === 0) return "ปานกลาง";
  return "ต่ำ";
}

function welfareFor(index: number, documentNeed: boolean): WelfareStatus {
  if (!documentNeed) return "พร้อม";
  const values: WelfareStatus[] = [
    "ขาดเอกสาร",
    "รอตรวจสอบสิทธิ",
    "ไม่ทราบสิทธิ",
    "อยู่ระหว่างดำเนินการ",
  ];
  return values[index % values.length];
}

function employmentFor(index: number): EmploymentReadiness {
  const values: EmploymentReadiness[] = [
    "ยังไม่พร้อม",
    "ต้องฟื้นฟูก่อน",
    "พร้อมบางส่วน",
    "พร้อมเริ่มงาน",
  ];
  return values[index % values.length];
}

function shelterFor(index: number, shelterNeed: boolean): ShelterStatus {
  if (shelterNeed && index % 2 === 0) return "ไม่มีที่พักคืนนี้";
  if (shelterNeed) return "อยู่ระหว่างประสาน";
  const values: ShelterStatus[] = ["มีที่พักชั่วคราว", "ไม่ทราบ", "ปฏิเสธที่พัก"];
  return values[index % values.length];
}

function referralsFor(index: number, mainNeed: MainNeed) {
  return [
    {
      date: `2026-06-${String((index % 9) + 1).padStart(2, "0")}`,
      service: mainNeed === "สุขภาพ" ? "คลินิกชุมชน" : "ประสานบริการหลัก",
      organization: mainNeed === "ที่พัก" ? "ศูนย์พักพิงกรุงเทพฯ" : "ทีมภาคสนาม CareKey",
      status: index % 3 === 0 ? "นัดหมายแล้ว" : "ส่งต่อแล้ว",
      note: "รับเรื่องและบันทึกความต้องการเบื้องต้น",
    },
    {
      date: `2026-06-${String((index % 9) + 10).padStart(2, "0")}`,
      service: index % 2 === 0 ? "ติดตามสิทธิและเอกสาร" : "ติดตามสุขภาพและที่พัก",
      organization: "เครือข่ายบริการสังคม",
      status: index % 4 === 0 ? "ติดตามต่อ" : "รอดำเนินการ",
      note: "รอติดต่อกลับและยืนยันเวลานัดหมาย",
    },
  ] as HomelessUser["referrals"];
}

export const homelessUsers: HomelessUser[] = Array.from({ length: 50 }, (_, zeroIndex) => {
  const index = zeroIndex + 1;
  const healthNeed = index % 3 === 0 || index % 5 === 0;
  const shelterNeed = index % 4 === 0 || index % 7 === 0;
  const documentNeed = index % 2 === 0 || index % 9 === 0;
  const employmentNeed = index % 4 === 3 || index % 8 === 0;
  const mentalHealthNeed = index % 5 === 0 || index % 17 === 0;
  const foodNeed = index % 6 === 1 || index % 11 === 0;
  const mainNeed = needs[
    healthNeed
      ? 0
      : shelterNeed
        ? 1
        : documentNeed
          ? 2
          : employmentNeed
            ? 3
            : mentalHealthNeed
              ? 4
              : index % needs.length
  ];

  return {
    id: `u-${String(index).padStart(3, "0")}`,
    careKeyId: `CK-${String(index).padStart(4, "0")}`,
    nickname: `${nicknames[zeroIndex % nicknames.length]}${index > 20 ? ` ${Math.ceil(index / 20)}` : ""}`,
    age: 19 + ((index * 7) % 49),
    gender: genders[index % genders.length],
    area: areas[zeroIndex % areas.length],
    areaType: areaTypes[zeroIndex % areaTypes.length],
    homelessDuration: `${(index % 8) + 1} เดือน`,
    mainReason: reasons[index % reasons.length],
    mainNeed,
    riskLevel: riskFor(index),
    shelterStatus: shelterFor(index, shelterNeed),
    healthNeed,
    mentalHealthNeed,
    documentNeed,
    employmentNeed,
    shelterNeed,
    foodNeed,
    welfareStatus: welfareFor(index, documentNeed),
    employmentReadiness: employmentFor(index),
    followUpStatus: followUps[index % followUps.length],
    assignedWorker: workers[index % workers.length],
    lastContactDate: `2026-06-${String((index % 12) + 1).padStart(2, "0")}`,
    notes:
      "ทีมภาคสนามพูดคุยเบื้องต้นแล้ว ผู้ใช้บริการยินดีรับการประสานบริการและต้องการติดตามต่ออย่างต่อเนื่อง",
    referrals: referralsFor(index, mainNeed),
  };
});
