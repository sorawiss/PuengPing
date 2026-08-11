import { homelessUsers } from "@/data/homeless-users";

const MODEL = "typhoon-v2.5-30b-a3b-instruct";
const DEFAULT_BASE_URL = "https://api.opentyphoon.ai/v1";
const MAX_HISTORY_MESSAGES = 20;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  question?: unknown;
  messages?: unknown;
};

type TyphoonResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

export async function POST(request: Request) {
  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim().slice(0, 8_000) : "";
  if (!question) {
    return Response.json({ error: "กรุณาพิมพ์คำถาม" }, { status: 400 });
  }

  const apiKey = process.env.TYPHOON_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ยังไม่ได้ตั้งค่า TYPHOON_API_KEY" }, { status: 503 });
  }

  try {
    const answer = await callTyphoon(question, normalizeHistory(body.messages), apiKey);
    return Response.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    return Response.json({ error: `เรียกใช้งาน AI ไม่สำเร็จ (${message})` }, { status: 502 });
  }
}

function normalizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((message): message is Record<string, unknown> => Boolean(message) && typeof message === "object")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" as const : "user" as const,
      content: typeof message.content === "string" ? message.content.trim().slice(0, 8_000) : "",
    }))
    .filter((message) => message.content.length > 0)
    .slice(-MAX_HISTORY_MESSAGES);
}

async function callTyphoon(question: string, history: ChatMessage[], apiKey: string) {
  const baseUrl = (process.env.TYPHOON_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const messages = history.at(-1)?.role === "user" && history.at(-1)?.content === question
    ? history
    : [...history, { role: "user" as const, content: question }];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "คุณคือผู้ช่วยข้อมูลเคส puengping สำหรับเจ้าหน้าที่ดูแลคนไร้บ้าน ตอบคำถามได้ทุกด้านที่เกี่ยวข้องกับข้อมูลในแอป เช่น สุขภาพ ความเสี่ยง ที่พัก เอกสารและสิทธิ สวัสดิการ การติดตาม การส่งต่อ ผู้รับผิดชอบ และการจับคู่งาน ใช้เฉพาะ APP_DATA ที่ให้มาเป็นข้อเท็จจริง ห้ามแต่งหรือคาดเดาข้อมูลบุคคล หากข้อมูลไม่เพียงพอให้บอกว่าไม่พบข้อมูลในระบบ แยกข้อเท็จจริงออกจากคำแนะนำอย่างชัดเจน เปิดเผยข้อมูลอ่อนไหวเท่าที่จำเป็นต่อการดูแลเคส ตอบเป็นข้อความธรรมดาโดยใช้ภาษาเดียวกับผู้ใช้เป็นหลัก ไม่ต้องตอบเป็น JSON หรือรูปแบบการ์ด",
        },
        {
          role: "system",
          content: `APP_DATA (ข้อมูลจำลองในระบบจำนวน ${homelessUsers.length} เคส): ${JSON.stringify(homelessUsers)}`,
        },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  const data = (await response.json()) as TyphoonResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("AI ไม่ได้ส่งข้อความตอบกลับ");

  return answer;
}