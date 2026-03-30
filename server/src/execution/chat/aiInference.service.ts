import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({}); // uses process.env.GEMINI_API_KEY

export const aiInferenceService = {
  streamChat: async function*(
    systemInstruction: string,
    history: { role: 'user' | 'model', content: string }[],
    newMessage: string,
    imgUrl?: string 
  ) {
    const contentParts: any[] = [{ text: newMessage }];

    if (imgUrl) {
      try {
        const response = await fetch(imgUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      } catch (err) {
        console.error("Failed to fetch image for AI prompt", err);
      }
    }

    const formattedHistory = history.map(h => ({
      role: h.role, 
      parts: [{ text: h.content }]
    }));

    const contents = [...formattedHistory, { role: 'user', parts: contentParts }];

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Giữ temperature thấp cho các bài toán logic giáo dục
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
};
