"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/priority-list";
import { needBadgeClass, riskBadgeClass } from "@/lib/format";
import { filterUsers, searchUsers } from "@/lib/mock-utils";
import type { FollowUpStatus, HomelessUser, MainNeed, RiskLevel, ShelterStatus } from "@/lib/types";

const mainNeeds: MainNeed[] = [
  "สุขภาพ",
  "ที่พัก",
  "เอกสาร/สิทธิ",
  "งาน/รายได้",
  "สุขภาพใจ",
  "อาหาร/ของใช้จำเป็น",
];
const riskLevels: RiskLevel[] = ["ต่ำ", "ปานกลาง", "สูง", "เร่งด่วน"];
const shelterStatuses: ShelterStatus[] = [
  "มีที่พักชั่วคราว",
  "ไม่มีที่พักคืนนี้",
  "อยู่ระหว่างประสาน",
  "ปฏิเสธที่พัก",
  "ไม่ทราบ",
];
const followUps: FollowUpStatus[] = [
  "ยังไม่เริ่ม",
  "ต้องติดตาม",
  "นัดหมายแล้ว",
  "ส่งต่อแล้ว",
  "เสร็จสิ้นบางส่วน",
];

export function UsersTable({ users }: { users: HomelessUser[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [mainNeed, setMainNeed] = useState<MainNeed | "">("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">("");
  const [shelterStatus, setShelterStatus] = useState<ShelterStatus | "">("");
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus | "">("");
  const areas = useMemo(() => Array.from(new Set(users.map((user) => user.area))), [users]);
  const visibleUsers = useMemo(
    () =>
      filterUsers(searchUsers(users, query), {
        area,
        mainNeed,
        riskLevel,
        shelterStatus,
        followUpStatus,
      }),
    [area, followUpStatus, mainNeed, query, riskLevel, shelterStatus, users],
  );

  function resetFilters() {
    setQuery("");
    setArea("");
    setMainNeed("");
    setRiskLevel("");
    setShelterStatus("");
    setFollowUpStatus("");
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(5,1fr)_auto]">
          <input
            className="min-h-11 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[var(--ci-blue)] focus:ring-2 focus:ring-sky-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหา เช่น ทาสี แข็งแรง พร้อมเริ่มงาน หรือพื้นที่"
            value={query}
          />
          <Select label="พื้นที่" onChange={setArea} options={areas} value={area} />
          <Select label="ความต้องการ" onChange={setMainNeed} options={mainNeeds} value={mainNeed} />
          <Select label="เร่งด่วน" onChange={setRiskLevel} options={riskLevels} value={riskLevel} />
          <Select label="ที่พัก" onChange={setShelterStatus} options={shelterStatuses} value={shelterStatus} />
          <Select label="ติดตาม" onChange={setFollowUpStatus} options={followUps} value={followUpStatus} />
          <button
            className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={resetFilters}
            type="button"
          >
            ล้าง
          </button>
        </div>
      </div>

      {visibleUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          ไม่พบข้อมูลที่ตรงกับเงื่อนไข ลองปรับตัวกรองอีกครั้ง
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {["รหัส", "ชื่อที่ใช้เรียก", "อายุ", "พื้นที่พบ", "ความต้องการหลัก", "เร่งด่วน", "ที่พัก", "ติดตาม", ""].map(
                    (header) => (
                      <th className="px-4 py-3 font-semibold" key={header}>
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => (
                  <tr className="align-top hover:bg-slate-50" key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">{user.puengpingId}</td>
                    <td className="px-4 py-3">{user.nickname}</td>
                    <td className="px-4 py-3">{user.age}</td>
                    <td className="px-4 py-3">{user.area}</td>
                    <td className="px-4 py-3">
                      <Badge className={needBadgeClass(user.mainNeed)}>{user.mainNeed}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.shelterStatus}</td>
                    <td className="px-4 py-3 text-slate-600">{user.followUpStatus}</td>
                    <td className="px-4 py-3">
                      <Link className="font-semibold text-[var(--ci-blue)]" href={`/people/${user.id}`}>
                        ดูรายละเอียด
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {visibleUsers.map((user) => (
              <Link
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                href={`/people/${user.id}`}
                key={user.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{user.nickname}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.puengpingId} · {user.age} ปี · {user.area}
                    </p>
                  </div>
                  <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{user.caseSummary}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Select<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T | "";
  onChange: (value: T | "") => void;
}) {
  return (
    <select
      aria-label={label}
      className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[var(--ci-blue)] focus:ring-2 focus:ring-sky-100"
      onChange={(event) => onChange(event.target.value as T | "")}
      value={value}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
