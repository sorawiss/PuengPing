"use client";

import { useState } from "react";
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
  role: "user" | "assistant";
  attachments?: Attachment[];
};

type ChatResponse = {
  answer?: string;
  error?: string;
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasConversation = messages.length > 0 || Boolean(error) || isLoading;

  async function submitQuestion(input: string) {
    const question = input.trim();
    if (!question) {
      setError("กรุณาพิมพ์คำถาม");
      return;
    }

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      content: question,
      role: "user",
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await response.json()) as ChatResponse;
      const answer = data.answer;

      if (!response.ok || !answer) {
        throw new Error(data.error || "เรียกใช้งาน AI ไม่สำเร็จ");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { id: crypto.randomUUID(), content: answer, role: "assistant" },
      ]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "เกิดข้อผิดพลาดในการเรียกใช้งาน AI");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-220px)] w-full max-w-4xl flex-col justify-end gap-6">
      <section aria-live="polite" className="space-y-4">
        {messages.map((message) => (
          <article
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ci-blue)] px-5 py-3 text-white"
                : "mr-auto max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-slate-800 shadow-sm"
            }
            key={message.id}
          >
            <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
          </article>
        ))}

        {isLoading ? (
          <div className="mr-auto w-full max-w-[92%] rounded-2xl rounded-bl-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className={hasConversation ? "sticky bottom-0 bg-[var(--background)] pb-2 pt-2" : "pb-[12vh]"}>
        <PureMultimodalInput
          attachments={attachments}
          canSend
          chatId="puengping-ai-chat"
          className="mx-auto"
          isGenerating={isLoading}
          messages={messages}
          onSendMessage={({ input }) => submitQuestion(input)}
          onStopGenerating={() => setIsLoading(false)}
          placeholder="ถาม AI ได้ทุกเรื่อง..."
          selectedVisibilityType="private"
          setAttachments={setAttachments}
          showAttachments={false}
          suggestedActions={suggestedActions}
        />
      </section>
    </div>
  );
}
