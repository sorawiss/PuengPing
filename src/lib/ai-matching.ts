import { homelessUsers } from "@/data/homeless-users";
import type { HomelessUser } from "@/lib/types";

export type AiCandidate = {
  id: string;
  careKeyId: string;
  nickname: string;
  fitScore: number;
  reasons: string[];
  cautions: string[];
  nextStep: string;
};

export type AiMatchResponse = {
  answer: string;
  candidates: AiCandidate[];
};

type ScoredUser = {
  user: HomelessUser;
  score: number;
  matchedTerms: string[];
};

const intentTerms: Record<string, string[]> = {
  ทาสี: ["ทาสี", "ช่างสี", "ขัดผนัง", "ก่อสร้าง", "ไซต์งาน"],
  สีบ้าน: ["ทาสี", "ช่างสี", "ขัดผนัง", "ก่อสร้าง"],
  คาร์แคร์: ["คาร์แคร์", "ล้างรถ", "ขัดสีรถ", "ผู้ช่วยช่างยนต์"],
  ล้างรถ: ["คาร์แคร์", "ล้างรถ", "ขัดสีรถ"],
  แอดมิน: ["แอดมิน", "คีย์ข้อมูล", "คอมพิวเตอร์", "จัดเอกสาร"],
  คีย์ข้อมูล: ["แอดมิน", "คีย์ข้อมูล", "คอมพิวเตอร์"],
  ครัว: ["ผู้ช่วยครัว", "ร้านอาหาร", "ล้างจาน", "ทำอาหาร", "เตรียมวัตถุดิบ"],
  อาหาร: ["ผู้ช่วยครัว", "ร้านอาหาร", "ล้างจาน", "ทำอาหาร", "ขายอาหาร"],
  ยกของ: ["ยกของ", "คลังสินค้า", "แพ็กสินค้า", "จัดเรียงสินค้า"],
  คลัง: ["คลังสินค้า", "ยกของ", "แพ็กสินค้า", "ตรวจนับสินค้า"],
  ส่งของ: ["ส่งของ", "ส่งเอกสาร", "แมสเซนเจอร์", "ขับรถ"],
  เฟอร์นิเจอร์: ["ประกอบเฟอร์นิเจอร์", "ติดตั้ง", "สว่าน", "แพ็กสินค้า"],
  ผู้สูงอายุ: ["ดูแลผู้สูงอายุ", "แม่บ้าน", "เตรียมอาหาร"],
  แม่บ้าน: ["แม่บ้าน", "ทำความสะอาด", "ซักรีด", "ดูแลผู้สูงอายุ"],
};

const readinessScore: Record<string, number> = {
  พร้อมเริ่มงาน: 22,
  พร้อมบางส่วน: 10,
  ต้องฟื้นฟูก่อน: -15,
  ยังไม่พร้อม: -35,
};

const riskPenalty: Record<string, number> = {
  ต่ำ: 4,
  ปานกลาง: 0,
  สูง: -10,
  เร่งด่วน: -25,
};

export function findLocalCandidates(question: string, limit = 8): AiCandidate[] {
  return scoreUsers(question)
    .slice(0, limit)
    .map(({ user, score, matchedTerms }) => toCandidate(user, score, matchedTerms));
}

export function buildCandidatePromptData(candidates: AiCandidate[]) {
  const byId = new Map(homelessUsers.map((user) => [user.id, user]));

  return candidates
    .map((candidate) => {
      const user = byId.get(candidate.id);
      if (!user) return null;

      return {
        id: user.id,
        careKeyId: user.careKeyId,
        nickname: user.nickname,
        age: user.age,
        area: user.area,
        mainNeed: user.mainNeed,
        riskLevel: user.riskLevel,
        employmentReadiness: user.employmentReadiness,
        physicalCondition: user.physicalCondition,
        healthSummary: user.healthSummary,
        skills: user.skills,
        workExperience: user.workExperience,
        employmentPreference: user.employmentPreference,
        availability: user.availability,
        workConstraints: user.workConstraints,
        documentSummary: user.documentSummary,
        officerObservation: user.officerObservation,
        caseSummary: user.caseSummary,
        aiSearchTags: user.aiSearchTags,
        localFitScore: candidate.fitScore,
      };
    })
    .filter(Boolean);
}

export function normalizeTyphoonCandidates(
  typhoonCandidates: Partial<AiCandidate>[] | undefined,
  fallbackCandidates: AiCandidate[],
) {
  if (!Array.isArray(typhoonCandidates)) return fallbackCandidates;

  const fallbackById = new Map(fallbackCandidates.map((candidate) => [candidate.id, candidate]));

  return typhoonCandidates
    .map((candidate) => {
      if (!candidate.id) return null;
      const fallback = fallbackById.get(candidate.id);
      if (!fallback) return null;

      return {
        id: fallback.id,
        careKeyId: fallback.careKeyId,
        nickname: fallback.nickname,
        fitScore: clampScore(Number(candidate.fitScore) || fallback.fitScore),
        reasons: normalizeStringArray(candidate.reasons, fallback.reasons),
        cautions: normalizeStringArray(candidate.cautions, fallback.cautions),
        nextStep:
          typeof candidate.nextStep === "string" && candidate.nextStep.trim()
            ? candidate.nextStep.trim()
            : fallback.nextStep,
      };
    })
    .filter((candidate): candidate is AiCandidate => Boolean(candidate));
}

function scoreUsers(question: string): ScoredUser[] {
  const terms = expandQuestionTerms(question);

  return homelessUsers
    .map((user) => {
      const text = searchableText(user);
      const matchedTerms = terms.filter((term) => text.includes(term.toLowerCase()));
      const skillHits = user.skills.filter((skill) => terms.some((term) => skill.toLowerCase().includes(term)));
      const tagHits = user.aiSearchTags.filter((tag) => terms.some((term) => tag.toLowerCase().includes(term)));

      let score = matchedTerms.length * 12 + skillHits.length * 16 + tagHits.length * 14;
      score += readinessScore[user.employmentReadiness] ?? 0;
      score += riskPenalty[user.riskLevel] ?? 0;
      score += user.healthNeed ? -8 : 5;
      score += user.employmentNeed ? 8 : 0;

      if (question.includes("ยก") || question.includes("แบก") || question.includes("หนัก")) {
        if (text.includes("ยกของ") || text.includes("แข็งแรง")) score += 18;
        if (text.includes("ไม่ควรยกของหนัก") || text.includes("ห้ามยกของหนัก")) score -= 35;
      }

      return { user, score, matchedTerms: Array.from(new Set([...matchedTerms, ...skillHits, ...tagHits])) };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function expandQuestionTerms(question: string) {
  const normalized = question.toLowerCase();
  const terms = new Set(
    normalized
      .split(/[\s,./()\-]+/)
      .map((term) => term.trim())
      .filter((term) => term.length >= 2),
  );

  for (const [trigger, relatedTerms] of Object.entries(intentTerms)) {
    if (normalized.includes(trigger)) {
      relatedTerms.forEach((term) => terms.add(term.toLowerCase()));
    }
  }

  return Array.from(terms);
}

function searchableText(user: HomelessUser) {
  return [
    user.nickname,
    user.area,
    user.mainNeed,
    user.riskLevel,
    user.employmentReadiness,
    user.physicalCondition,
    user.healthSummary,
    user.skills.join(" "),
    user.workExperience.join(" "),
    user.employmentPreference.join(" "),
    user.availability,
    user.workConstraints,
    user.documentSummary,
    user.officerObservation,
    user.caseSummary,
    user.aiSearchTags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function toCandidate(user: HomelessUser, score: number, matchedTerms: string[]): AiCandidate {
  const reasons = [
    user.skills.length ? `มีทักษะ: ${user.skills.slice(0, 3).join(", ")}` : "",
    user.workExperience.length ? user.workExperience[0] : "",
    user.employmentReadiness === "พร้อมเริ่มงาน" ? "สถานะการจ้างงานพร้อมเริ่มงาน" : user.employmentReadiness,
    matchedTerms.length ? `ตรงกับคำค้น: ${matchedTerms.slice(0, 5).join(", ")}` : "",
  ].filter(Boolean);

  const cautions = [
    user.healthNeed ? `ควรตรวจสุขภาพ/พิจารณาข้อจำกัด: ${user.healthSummary}` : "",
    user.workConstraints,
    user.documentNeed ? `เอกสาร/สิทธิ: ${user.documentSummary}` : "",
    user.riskLevel === "สูง" || user.riskLevel === "เร่งด่วน"
      ? `ระดับเร่งด่วน ${user.riskLevel} ควรประเมินความพร้อมก่อนส่งงาน`
      : "",
  ].filter(Boolean);

  return {
    id: user.id,
    careKeyId: user.careKeyId,
    nickname: user.nickname,
    fitScore: clampScore(score),
    reasons,
    cautions,
    nextStep: `ติดต่อ ${user.assignedWorker} เพื่อตรวจความพร้อมและยืนยันเงื่อนไขงานกับ ${user.nickname}`,
  };
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return strings.length ? strings.slice(0, 5) : fallback;
}
