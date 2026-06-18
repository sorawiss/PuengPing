"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AiMatchResponse } from "@/lib/ai-matching";
import { homelessUsers } from "@/data/homeless-users";
import { Badge } from "@/components/priority-list";
import { needBadgeClass, riskBadgeClass } from "@/lib/format";
import { PureMultimodalInput } from "@/components/ui/multimodal-ai-chat-input";

type Attachment = {
  url: string;
  name: string;
  contentType: string;
  size: number;
};

type UIMessage = {
  id: string;
  content: string;
  role: string;
  attachments?: Attachment[];
};

const suggestedActions = [
  {
    title: "หาคนทาสีบ้าน",
    label: "ดูทักษะช่างสี สุขภาพ และความพร้อม",
    action: "อยากได้คนไปทำงานทาสีบ้าน",
  },
  {
    title: "งานครัวหรือล้างจาน",
    label: "หาคนที่เคยทำร้านอาหาร",
    action: "มีคนทำงานครัวหรือล้างจานได้ไหม",
  },
  {
    title: "คาร์แคร์หรือล้างรถ",
    label: "ดูประสบการณ์งานรถ",
    action: "มีคนทำคาร์แคร์หรือล้างรถไหม",
  },
  {
    title: "แอดมินคีย์ข้อมูล",
    label: "หาคนใช้คอมพิวเตอร์พื้นฐานได้",
    action: "อยากได้คนช่วยแอดมินคีย์ข้อมูล",
  },
];

export function AiMatchPanel() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [result, setResult] = useState<AiMatchResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const usersById = useMemo(() => new Map(homelessUsers.map((user) => [user.id, user])), []);
  const hasResponse = Boolean(result || error || isLoading);

  async function submitQuestion(input: string) {
    const trimmedQuestion = input.trim();
    if (!trimmedQuestion) {
      setError("กรุณาพิมพ์คำถามหรือความต้องการงานก่อน");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${Date.now()}`, content: trimmedQuestion, role: "user" },
    ]);

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เรียกใช้งาน AI ไม่สำเร็จ");
      }

      const matchResult = data as AiMatchResponse;
      setResult(matchResult);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: `assistant-${Date.now()}`, content: matchResult.answer, role: "assistant" },
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "เกิดข้อผิดพลาดในการเรียกใช้งาน AI");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-4xl flex-col justify-end gap-6">
      <section className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="mt-4 space-y-3">
              <div className="h-3 rounded bg-slate-100" />
              <div className="h-3 w-5/6 rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ) : null}

        {result ? (
          <>
            <section className="rounded-lg border border-[var(--ci-green)] bg-emerald-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">คำตอบจาก AI</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-950">{result.answer}</p>
            </section>

            {result.candidates.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                ไม่พบผู้ใช้บริการที่เหมาะสมจากข้อมูลจำลองชุดนี้
              </div>
            ) : (
              <div className="space-y-3">
                {result.candidates.map((candidate, index) => {
                  const user = usersById.get(candidate.id);
                  if (!user) return null;

                  return (
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={candidate.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ci-blue)]">อันดับ {index + 1}</p>
                          <h3 className="mt-1 text-xl font-semibold text-slate-950">
                            {user.nickname} <span className="text-sm font-medium text-slate-500">{user.puengpingId}</span>
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {user.age} ปี · {user.area} · คะแนน {candidate.fitScore}/100
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={riskBadgeClass(user.riskLevel)}>{user.riskLevel}</Badge>
                          <Badge className={needBadgeClass(user.mainNeed)}>{user.mainNeed}</Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InfoList title="เหตุผลที่เหมาะ" values={candidate.reasons} />
                        <InfoList title="ข้อควรตรวจสอบ" values={candidate.cautions} />
                      </div>

                      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                        <p className="font-semibold text-slate-950">ข้อมูลประกอบ</p>
                        <p className="mt-1">ทักษะ: {user.skills.slice(0, 5).join(", ")}</p>
                        <p>สภาพร่างกาย: {user.physicalCondition}</p>
                        <p>ความพร้อม: {user.availability}</p>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-6 text-slate-600">{candidate.nextStep}</p>
                        <Link
                          className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          href={`/people/${candidate.id}`}
                        >
                          ดูรายละเอียด
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </section>

      <section className={hasResponse ? "pb-2" : "pb-[12vh]"}>
        <PureMultimodalInput
          attachments={attachments}
          canSend
          chatId="puengping-ai-match"
          className="mx-auto"
          isGenerating={isLoading}
          messages={messages}
          onSendMessage={({ input }) => submitQuestion(input)}
          onStopGenerating={() => setIsLoading(false)}
          placeholder="ถาม AI เช่น อยากได้คนไปทำงานทาสีบ้าน"
          selectedVisibilityType="private"
          setAttachments={setAttachments}
          showAttachments={false}
          suggestedActions={suggestedActions}
        />
      </section>
    </div>
  );
}

function InfoList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
        {values.length ? (
          values.map((value) => <li key={value}>- {value}</li>)
        ) : (
          <li>- ไม่มีข้อมูลเพิ่มเติม</li>
        )}
      </ul>
    </div>
  );
}
