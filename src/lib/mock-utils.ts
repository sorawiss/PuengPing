import { homelessUsers } from "@/data/homeless-users";
import type { FollowUpStatus, HomelessUser, MainNeed, RiskLevel, ShelterStatus } from "@/lib/types";

export type UserFilters = {
  area?: string;
  mainNeed?: MainNeed | "";
  riskLevel?: RiskLevel | "";
  shelterStatus?: ShelterStatus | "";
  followUpStatus?: FollowUpStatus | "";
};

export function getTotalUsers() {
  return homelessUsers.length;
}

export function getUsersByRiskLevel() {
  return countBy(homelessUsers, "riskLevel");
}

export function getUsersByMainNeed() {
  return countBy(homelessUsers, "mainNeed");
}

export function getUsersNeedingShelter() {
  return homelessUsers.filter((user) => user.shelterNeed || user.shelterStatus === "ไม่มีที่พักคืนนี้");
}

export function getUsersNeedingHealthSupport() {
  return homelessUsers.filter((user) => user.healthNeed);
}

export function getUsersWithDocumentIssues() {
  return homelessUsers.filter((user) => user.documentNeed || user.welfareStatus !== "พร้อม");
}

export function getEmploymentReadyUsers() {
  return homelessUsers.filter((user) => user.employmentReadiness === "พร้อมเริ่มงาน");
}

const riskWeight: Record<RiskLevel, number> = {
  "เร่งด่วน": 4,
  "สูง": 3,
  "ปานกลาง": 2,
  "ต่ำ": 1,
};

export function getUrgentUsers() {
  return homelessUsers
    .filter(
      (user) =>
        user.riskLevel === "เร่งด่วน" ||
        user.riskLevel === "สูง" ||
        user.healthNeed ||
        user.shelterStatus === "ไม่มีที่พักคืนนี้" ||
        user.documentNeed,
    )
    .sort((a, b) => riskWeight[b.riskLevel] - riskWeight[a.riskLevel])
    .slice(0, 8);
}

export function getRecentReferrals() {
  return homelessUsers
    .flatMap((user) =>
      user.referrals.map((referral) => ({
        ...referral,
        userId: user.id,
        nickname: user.nickname,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
}

export function searchUsers(users: HomelessUser[], query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return users;
  return users.filter((user) =>
    [
      user.nickname,
      user.area,
      user.puengpingId,
      user.mainNeed,
      user.assignedWorker,
      user.physicalCondition,
      user.healthSummary,
      user.skills.join(" "),
      user.workExperience.join(" "),
      user.employmentPreference.join(" "),
      user.availability,
      user.workConstraints,
      user.documentSummary,
      user.socialSupportSummary,
      user.officerObservation,
      user.caseSummary,
      user.aiSearchTags.join(" "),
      user.notes,
    ]
      .join(" ")
      .toLowerCase()
      .includes(value),
  );
}

export function filterUsers(users: HomelessUser[], filters: UserFilters) {
  return users.filter((user) => {
    if (filters.area && user.area !== filters.area) return false;
    if (filters.mainNeed && user.mainNeed !== filters.mainNeed) return false;
    if (filters.riskLevel && user.riskLevel !== filters.riskLevel) return false;
    if (filters.shelterStatus && user.shelterStatus !== filters.shelterStatus) return false;
    if (filters.followUpStatus && user.followUpStatus !== filters.followUpStatus) return false;
    return true;
  });
}

function countBy<T extends keyof HomelessUser>(users: HomelessUser[], key: T) {
  return users.reduce<Record<string, number>>((result, user) => {
    const value = String(user[key]);
    result[value] = (result[value] ?? 0) + 1;
    return result;
  }, {});
}
