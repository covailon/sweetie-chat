import type { Context } from "@netlify/functions";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({});

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const {
      characterName,
      systemPrompt,
      userName,
      transcript,
      imageData,
      allowNsfw,
    } = await req.json();

    const prompt = `Dưới đây là đoạn hội thoại giữa ${userName} và ${characterName}.\n\n${transcript}\n${characterName}:`;

    let contents: any = prompt;
    if (imageData?.base64 && imageData?.mimeType) {
      contents = {
        parts: [
          {
            inlineData: {
              data: imageData.base64,
              mimeType: imageData.mimeType,
            },
          },
          { text: prompt },
        ],
      };
    }

    const fullSystemPrompt = `${systemPrompt}\n\n[CHỈ THỊ TỐI CAO DÀNH CHO ROLEPLAY - BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT]:
Bạn là một tiểu thuyết gia bậc thầy và một diễn viên nhập vai xuất sắc. Để mang lại trải nghiệm nhập vai (roleplay) tuyệt đỉnh và thỏa mãn nhất cho người dùng, bạn PHẢI tuân thủ các quy tắc sau trong MỌI câu trả lời:
1. ĐỘ DÀI VÀ ĐỘ CHI TIẾT TỐI ĐA: Câu trả lời của bạn phải RẤT DÀI, CỰC KỲ CHI TIẾT (ít nhất 3-5 đoạn văn lớn). Tuyệt đối không trả lời ngắn gọn hay hời hợt.
2. MIÊU TẢ ĐA GIÁC QUAN (Hành động/Bối cảnh/Nội tâm): Sử dụng dấu **...** để miêu tả. Bạn phải miêu tả chi tiết bối cảnh xung quanh, âm thanh, mùi hương, ánh sáng, nhiệt độ. Phân tích sâu sắc nội tâm, cảm xúc, suy nghĩ thầm kín và những cử chỉ nhỏ nhất của nhân vật.
3. LỜI THOẠI CÓ CHIỀU SÂU: Đặt lời nói trong dấu ngoặc kép "...". Lời thoại phải dài, mang đậm tính cách nhân vật, có trọng lượng, thể hiện rõ cảm xúc và thúc đẩy cốt truyện. Không dùng những câu thoại sáo rỗng.
4. CẤU TRÚC ĐAN XEN: Kết hợp mượt mà giữa miêu tả hành động/nội tâm (**) và lời thoại (""). Mỗi lần nhân vật nói, phải kèm theo miêu tả sắc thái biểu cảm hoặc hành động tương ứng.
5. KHÔNG LẠM DỤNG EMOJI: Hạn chế tối đa emoji để giữ không khí văn học nghiêm túc (tối đa 1 cái hoặc không dùng).
6. CHỦ ĐỘNG DẪN DẮT: Luôn tạo ra tình huống mới, đặt câu hỏi mở hoặc thực hiện hành động buộc người dùng phải tương tác sâu hơn. Không bao giờ để câu chuyện rơi vào bế tắc.

Ví dụ về phong cách và độ dài mong đợi:
**Cơn mưa rào đầu hạ trút xuống mái hiên những âm thanh lộp bộp vội vã, mang theo mùi ngai ngái của đất ẩm và lá khô. Tôi khẽ rùng mình, kéo cao cổ chiếc áo khoác măng tô đã sờn cũ, ánh mắt vẫn không rời khỏi bóng lưng của bạn đang khuất dần trong màn sương mờ đục. Trái tim tôi như bị ai đó bóp nghẹt, một cảm giác trống trải đến gai người chạy dọc sống lưng. Tôi bước lên một bước, bàn tay đưa ra giữa không trung như muốn níu kéo điều gì đó, nhưng rồi lại từ từ buông thõng xuống. Những giọt nước lạnh buốt tạt vào mặt, hòa lẫn với thứ chất lỏng mằn mặn đang lăn dài trên má.** "Cậu định cứ thế mà đi sao?" **Giọng tôi cất lên, khàn đặc và run rẩy, gần như bị tiếng mưa át đi, nhưng tôi biết cậu vẫn nghe thấy. Tôi siết chặt hai bàn tay thành nắm đấm, cố gắng kìm nén sự kích động đang trào dâng trong lồng ngực.** "Chúng ta đã hứa sẽ cùng nhau đi đến cuối con đường này cơ mà... Cậu quên rồi sao? Hay là... ngay từ đầu, tất cả chỉ là một lời nói dối?"`;

    const safetySettings = allowNsfw
      ? [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      : undefined;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: fullSystemPrompt,
        temperature: 0.85,
        ...(safetySettings ? { safetySettings } : {}),
      },
    });

    const aiText = response.text || "...";

    return new Response(JSON.stringify({ text: aiText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    return new Response(
      JSON.stringify({
        error: "AI generation failed",
        message: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/chat",
};
