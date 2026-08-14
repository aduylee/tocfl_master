const express = require("express");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // ==============================
    // 1. Kiểm tra tin nhắn
    // ==============================
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Tin nhắn không được để trống",
      });
    }

    // ==============================
    // 2. Kiểm tra API Key
    // ==============================
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Chưa cấu hình GEMINI_API_KEY trong file .env",
      });
    }

    // ==============================
    // 3. System instruction
    // ==============================
    const systemInstruction = `
Bạn là trợ lý gia sư của website TOCFL Master.

Nhiệm vụ của bạn:

- Hỗ trợ người dùng học tiếng Trung Phồn thể.
- Khi viết tiếng Trung, ưu tiên sử dụng chữ Phồn thể (繁體中文).
- Khi giải thích từ vựng tiếng Trung, cung cấp Pinyin.
- Giải thích bằng tiếng Việt.
- Có thể hỗ trợ:
  + Từ vựng
  + Ngữ pháp
  + Đặt câu
  + Dịch tiếng Trung
  + Pinyin
  + Luyện thi TOCFL
  + Giải thích câu tiếng Trung
- Trả lời ngắn gọn, dễ hiểu và thân thiện.
- Nếu người dùng hỏi một câu đơn giản như "hello", "hi", "xin chào", hãy trả lời bình thường.
- Không được từ chối những câu hỏi học tập thông thường.
`;

    // ==============================
    // 4. Model Gemini
    // ==============================
    const modelName = "gemini-3.6-flash";

    // ==============================
    // 5. Gọi Gemini Interactions API
    // ==============================
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          model: modelName,

          system_instruction: systemInstruction,

          input: message.trim(),
        }),
      }
    );

    // ==============================
    // 6. Đọc JSON response
    // ==============================
    const data = await response.json();

    // In response ra terminal để debug
    console.log(
      ">>> Gemini response:",
      JSON.stringify(data, null, 2)
    );

    // ==============================
    // 7. Kiểm tra API có lỗi không
    // ==============================
    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "Gemini API trả về lỗi.",
      });
    }

    // ==============================
    // 8. Tìm model_output
    // ==============================
    const modelOutputStep = data?.steps?.find(
      (step) => step.type === "model_output"
    );

    // ==============================
    // 9. Lấy content
    // ==============================
    const content = modelOutputStep?.content;

    // ==============================
    // 10. Lấy text từ content
    // ==============================
    let replyText = "";

    if (Array.isArray(content)) {
      replyText = content
        .filter((item) => item.type === "text")
        .map((item) => item.text || "")
        .join("\n")
        .trim();
    }

    // ==============================
    // 11. Fallback nếu API trả dạng khác
    // ==============================
    if (!replyText && typeof content === "string") {
      replyText = content.trim();
    }

    // ==============================
    // 12. Kiểm tra có câu trả lời không
    // ==============================
    if (!replyText) {
      console.error(
        "Gemini không trả về nội dung text."
      );

      console.error(
        "Model output step:",
        JSON.stringify(
          modelOutputStep,
          null,
          2
        )
      );

      return res.status(500).json({
        success: false,
        error: "Gemini không trả về câu trả lời.",
      });
    }

    // ==============================
    // 13. Thành công
    // ==============================
    console.log(
      `>>> Gemini hoạt động thành công với model: ${modelName}`
    );

    console.log(
      ">>> Gemini reply:",
      replyText
    );

    // ==============================
    // 14. Trả kết quả về Frontend
    // ==============================
    return res.json({
      success: true,
      reply: replyText,
    });

  } catch (error) {
    // ==============================
    // 15. Lỗi server
    // ==============================
    console.error(
      "Lỗi Server Chatbot:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Lỗi kết nối server backend.",
    });
  }
});

module.exports = router;