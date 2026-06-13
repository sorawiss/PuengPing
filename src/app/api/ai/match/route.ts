import {
  type AiMatchResponse,
  type TyphoonSelection,
  buildCandidatePromptData,
  findLocalCandidates,
  normalizeTyphoonSelection,
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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
  
  const requestBody = {
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
        role: "system",
        content:
          "Return only these JSON fields: answer, selectedIds, reasoningById, cautionById, nextStepById. Do not return candidate objects, nickname, careKeyId, profile fields, or card data. selectedIds must contain only ids from the provided candidates.",
      },
      {
        role: "user",
        content: JSON.stringify({
          question,
          candidates: buildCandidatePromptData(localCandidates),
          requiredOutput: {
            answer: "คำตอบภาษาไทย 2-4 ประโยค สรุปคนที่เหมาะ เหตุผล และข้อควรตรวจสอบ",
            selectedIds: ["เฉพาะ id จาก candidates เท่านั้น เลือกได้มากกว่า 1 คน ถ้าไม่เหมาะให้ส่ง array ว่าง"],
            reasoningById: {
              "candidate-id": "เหตุผลสั้น ๆ ว่าทำไมคนนี้เหมาะ",
            },
            cautionById: {
              "candidate-id": "ข้อควรตรวจสอบสั้น ๆ ก่อนประสานงาน",
            },
            nextStepById: {
              "candidate-id": "ขั้นตอนถัดไปที่เจ้าหน้าที่ควรทำ",
            },
          },
        }),
      },
    ],
  };

  console.log("\n=================== AI MATCH START ===================");
  console.log(`[AI] Question: "${question}"`);
  console.log(`[AI] Local Candidates Sent: ${localCandidates.length} users`);
  console.log(`[AI] Using Model: ${MODEL}`);
  console.time("[AI] API Latency");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.timeEnd("[AI] API Latency");

  if (!response.ok) {
    const text = await response.text();
    console.error(`[AI] Error Response (HTTP ${response.status}):`, text.slice(0, 500));
    console.log("=================== AI MATCH ERROR ===================\n");
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  const data = (await response.json()) as TyphoonResponse;
  const content = data.choices?.[0]?.message?.content;
  
  if (data.usage) {
    console.log(`[AI] Tokens Used: ${data.usage.total_tokens} (Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens})`);
  }

  if (!content) {
    console.error("[AI] Error: Empty content in response");
    console.log("=================== AI MATCH ERROR ===================\n");
    throw new Error("Typhoon ไม่ได้ส่งข้อความตอบกลับ");
  }

  console.log("[AI] Raw Response Content:");
  console.log(content);

  const parsed = parseJsonContent(content);
  
  console.log("[AI] Parsed Content:");
  console.log(JSON.stringify(parsed, null, 2));
  console.log("=================== AI MATCH END =====================\n");

  const candidates = normalizeTyphoonSelection(parsed, localCandidates);

  return {
    answer:
      typeof parsed.answer === "string" && parsed.answer.trim()
        ? parsed.answer.trim()
        : "พบผู้ใช้บริการที่อาจเหมาะสมตามข้อมูลจำลอง โปรดตรวจสอบรายละเอียดและยืนยันความพร้อมก่อนประสานงาน",
    candidates,
  } satisfies AiMatchResponse;
}

function parseJsonContent(content: string): TyphoonSelection {
  try {
    return normalizeParsedContent(JSON.parse(content));
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Typhoon ตอบกลับไม่ใช่ JSON");
    return normalizeParsedContent(JSON.parse(match[0]));
  }
}

function normalizeParsedContent(value: unknown): TyphoonSelection {
  if (!value || typeof value !== "object") return {};
  const parsed = value as TyphoonSelection;
  return {
    answer: parsed.answer,
    selectedIds: parsed.selectedIds,
    reasoningById: parsed.reasoningById,
    cautionById: parsed.cautionById,
    nextStepById: parsed.nextStepById,
  };
}
