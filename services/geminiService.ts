
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter and process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const moderateContent = async (content: string): Promise<{ safe: boolean; reason?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下校园社交平台内容是否违反社区准则（如色情、暴力、严重的人身攻击、泄露隐私等）。内容: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["safe"]
        }
      }
    });

    // Directly access .text property as it is a getter
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Content moderation failed", error);
    return { safe: true }; // Fallback to safe if API fails
  }
};

export const suggestTags = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `根据内容推荐一个标签（表白墙, 吐槽墙, 校园日常, 求助）。内容: "${content}"`,
    });
    // Directly access .text property
    return response.text.trim();
  } catch {
    return "校园日常";
  }
};
