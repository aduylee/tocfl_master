import { useState } from "react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function ChatAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "你好！Tôi là AI Tutor của TOCFL-Master. Bạn cần hỗ trợ gì về từ vựng hay ngữ pháp hôm nay?",
    },
  ]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Lỗi kết nối AI. Vui lòng thử lại!" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Không thể kết nối máy chủ backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút mở/đóng Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-2 transition duration-300 transform hover:scale-105 cursor-pointer"
        >
          <span className="text-xl">🤖</span>
          <span className="hidden md:inline">Hỏi AI Tutor</span>
        </button>
      )}

      {/* Khung Cửa Sổ Chat */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-sm">TOCFL AI Tutor</h3>
                <p className="text-[10px] text-red-100">
                  Hỗ trợ Phồn thể & Ngữ pháp
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 text-xs text-gray-400 animate-pulse">
                  AI đang trả lời...
                </div>
              </div>
            )}
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi hoặc từ vựng..."
              className="flex-1 bg-slate-100 text-gray-800 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}