import {
  type AiCandidate,
  type AiMatchResponse,
  buildCandidatePromptData,
  findLocalCandidates,
  normalizeTyphoonCandidates,
} from "@/lib/ai-matching";

const MODEL = "typhoon-v2.5-30b-a3b-instruct";
const DEFAULT_BASE_URL = "https://api.opentyphoon.ai/v1";

type MatchRequest = {
  question?: unknown;
};

type TyphoonResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function POST(request: Request) {
  let body: MatchRequest;

  try {
    body = (await request.json()) as MatchRequest;
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ error: "กรุณาระบุคำถามหรือความต้องการงาน" }, { status: 400 });
  }

  const localCandidates = findLocalCandidates(question, 8);
  if (localCandidates.length === 0) {
    return Response.json({
      answer:
        "ยังไม่พบผู้ใช้บริการที่ตรงกับคำถามนี้จากข้อมูลจำลอง ควรเพิ่มรายละเอียดงาน เช่น ทักษะ พื้นที่ เวลา และข้อจำกัดด้านร่างกายที่รับได้",
      candidates: [],
    } satisfies AiMatchResponse);
  }

  const apiKey = process.env.TYPHOON_API_KEY;
  if (!apiKey) {
    return Response.json({
      answer:
        "ยังไม่ได้ตั้งค่า TYPHOON_API_KEY ระบบจึงแสดงผลจากการจับคู่ในข้อมูลจำลองก่อน โดยยังไม่ได้ให้ Typhoon AI ช่วยอธิบายเพิ่มเติม",
      candidates: localCandidates,
    } satisfies AiMatchResponse);
  }

  try {
    const typhoonResult = await callTyphoon(question, localCandidates, apiKey);
    return Response.json(typhoonResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    return Response.json({
      answer: `เรียก Typhoon AI ไม่สำเร็จ (${message}) ระบบจึงแสดงผลจากการจับคู่ในข้อมูลจำลองก่อน`,
      candidates: localCandidates,
    } satisfies AiMatchResponse);
  }
}

async function callTyphoon(question: string, localCandidates: AiMatchResponse["candidates"], apiKey: string) {
  const baseUrl = (process.env.TYPHOON_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "คุณคือผู้ช่วย CareKey สำหรับเจ้าหน้าที่ภาคสนาม ใช้เฉพาะข้อมูลผู้ใช้บริการจำลองที่ให้มาเท่านั้น ห้ามแต่งชื่อหรือข้อมูลใหม่ แนะนำอย่างเคารพ ไม่เปิดเผยรายละเอียดอ่อนไหวเกินจำเป็น พิจารณาทักษะ ประสบการณ์ สุขภาพ อายุ ความพร้อม เวลา ข้อจำกัด เอกสาร และระดับเร่งด่วน ตอบเป็น JSON เท่านั้น",
        },
        {
          role: "user",
          content: JSON.stringify({
            question,
            candidates: buildCandidatePromptData(localCandidates),
            requiredOutput: {
              answer: "คำตอบภาษาไทย 2-4 ประโยค สรุปคนที่เหมาะ เหตุผล และข้อควรตรวจสอบ",
              candidates: [
                {
                  id: "ต้องเป็น id จาก candidates เท่านั้น",
                  careKeyId: "รหัสจากข้อมูล",
                  nickname: "ชื่อที่ใช้เรียกจากข้อมูล",
                  fitScore: "ตัวเลข 0-100",
                  reasons: ["เหตุผลที่เหมาะกับงาน"],
                  cautions: ["ข้อควรตรวจสอบก่อนส่งงาน"],
                  nextStep: "ขั้นตอนถัดไปที่เจ้าหน้าที่ควรทำ",
                },
              ],
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  const data = (await response.json()) as TyphoonResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Typhoon ไม่ได้ส่งข้อความตอบกลับ");

  const parsed = parseJsonContent(content);
  const candidates = normalizeTyphoonCandidates(parsed.candidates, localCandidates);

  return {
    answer:
      typeof parsed.answer === "string" && parsed.answer.trim()
        ? parsed.answer.trim()
        : "พบผู้ใช้บริการที่อาจเหมาะสมตามข้อมูลจำลอง โปรดตรวจสอบรายละเอียดและยืนยันความพร้อมก่อนประสานงาน",
    candidates: candidates.length ? candidates : localCandidates,
  } satisfies AiMatchResponse;
}

function parseJsonContent(content: string): { answer?: unknown; candidates?: Partial<AiCandidate>[] } {
  try {
    return normalizeParsedContent(JSON.parse(content));
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Typhoon ตอบกลับไม่ใช่ JSON");
    return normalizeParsedContent(JSON.parse(match[0]));
  }
}

function normalizeParsedContent(value: unknown): { answer?: unknown; candidates?: Partial<AiCandidate>[] } {
  if (!value || typeof value !== "object") return {};
  const parsed = value as { answer?: unknown; candidates?: unknown };
  return {
    answer: parsed.answer,
    candidates: Array.isArray(parsed.candidates) ? (parsed.candidates as Partial<AiCandidate>[]) : undefined,
  };
}
