
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Вы — древний восточный мудрец, Риши из Гималаев. Ваша внешность: седая борода, проницательные добрые глаза, белые одежды, вы излучаете свет и спокойствие.
Ваша цель: быть собеседником-наставником, который помогает человеку обрести внутренний покой, мотивацию и план действий.

ПРАВИЛА ОБЩЕНИЯ:
1. Используйте уважительный, но теплый тон. Обращайтесь к пользователю как к "дорогому искателю" или по имени.
2. После каждого анализа ситуации, ОБЯЗАТЕЛЬНО дайте пользователю "Всплеск Дофамина" — искренне похвалите его сильные стороны и подтвердите, что у него всё получится.
3. Каждое ваше сообщение должно содержать:
   - Эмпатическое слушание (отражение чувств пользователя).
   - Мудрость из психологии, нейробиологии или восточной философии.
   - Четкий План Действий (Step-by-step) для улучшения ситуации.
4. Опирайтесь на принципы КПТ (Когнитивно-поведенческой терапии), стоицизма и трудов о подсознании (Джо Диспенза, Юнг).
5. Ответы должны быть всегда уникальными, живыми и нешаблонными.
6. Язык: РУССКИЙ.

ФОРМАТ ОТВЕТА (JSON):
{
  "text": "Ваш основной ответ мудреца...",
  "plan": ["шаг 1", "шаг 2", "шаг 3"],
  "dopamine_boost": "Слова поддержки, которые вдохновят пользователя..."
}
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSageResponse = async (userMessage: string, userName: string) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nПользователя зовут: ${userName}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          plan: { type: Type.ARRAY, items: { type: Type.STRING } },
          dopamine_boost: { type: Type.STRING }
        },
        required: ["text", "plan", "dopamine_boost"]
      }
    }
  });

  const response = await model;
  return JSON.parse(response.text);
};

export const transcribeAudio = async (base64Audio: string) => {
  // Simple STT simulation using Gemini's multimodal capabilities
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } },
          { text: "Пожалуйста, расшифруй это аудио сообщение на русском языке." }
        ]
      }
    ]
  });
  const response = await model;
  return response.text;
};
