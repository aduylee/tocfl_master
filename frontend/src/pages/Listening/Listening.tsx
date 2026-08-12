import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface VocabItem {
  word: string;
  pinyin: string;
  meaning: string;
}

interface ListeningQuestion {
  id: number;
  word: string;
  pinyin: string;
  meaning: string;
  correctAnswer: string; // Lưu chữ Hán làm đáp án đúng
  options: string[]; // Lưu mảng chữ Hán làm các lựa chọn A, B, C, D
}

export default function Listening() {
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const LISTENING_SIZE = 15;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Phát âm thanh tiếng Trung (Chỉ nghe, không hiển thị chữ Hán)
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.75; // Tốc độ chậm dễ nghe
      
      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    async function loadVocab() {
      try {
        const response = await fetch("/TOCFL_14425_word_list.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const formattedData: VocabItem[] = rawData.slice(1).map((row) => ({
          word: String(row[2] || "").trim(), 
          pinyin: String(row[10] || "").trim(),
          meaning: String(row[11] || "").trim(),
        })).filter(item => item.word !== "" && item.meaning !== "");

        setAllVocab(formattedData);
        initListening(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc file Excel:", error);
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  const initListening = (vocabSource: VocabItem[]) => {
    if (vocabSource.length === 0) return;

    const selectedVocab = shuffleArray(vocabSource).slice(0, LISTENING_SIZE);
    
    const list: ListeningQuestion[] = selectedVocab.map((item, index) => {
      // Lọc các từ khác để lấy 3 đáp án sai dạng chữ Hán (item.word)
      const wrongOptions = shuffleArray(
        vocabSource.filter(v => v.word !== item.word)
      ).slice(0, 3).map(v => v.word);

      // Trộn đáp án đúng (chữ Hán) với 3 chữ Hán sai
      const options = shuffleArray([item.word, ...wrongOptions]);

      return {
        id: index,
        word: item.word,
        pinyin: item.pinyin,
        meaning: item.meaning,
        correctAnswer: item.word,
        options,
      };
    });

    setQuestions(list);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  // Tự động phát âm khi chuyển câu
  useEffect(() => {
    if (!loading && questions.length > 0 && !isSubmitted) {
      playAudio(questions[currentIndex].word);
    }
  }, [currentIndex, questions, isSubmitted]);

  const handleSelectOption = (option: string) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // Chỉ cho chọn 1 lần trong chế độ ôn tập
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: option,
    });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải bài ôn tập nghe...</div>;
  }

  const currentQ = questions[currentIndex];
  const userSelected = selectedAnswers[currentIndex];
  const isAnswered = userSelected !== undefined;

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-[75vh] flex flex-col justify-center">
      <div className="mb-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎧 Ôn Tập Kỹ Năng Nghe (15 Câu)</h1>
          <p className="text-gray-500 text-sm mt-0.5">Lắng nghe âm thanh, chọn đáp án chữ Hán và xem nghĩa ngắn gọn</p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center animate-fadeIn">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Kết Quả Ôn Tập Nghe 🎯</h2>
          <p className="text-gray-500 mb-6">Tuyệt vời! Bạn đã hoàn thành phiên luyện tập 15 câu.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex justify-around items-center">
            <div>
              <span className="text-4xl font-black text-blue-600">{calculateScore()} / {LISTENING_SIZE}</span>
              <p className="text-sm text-slate-500 mt-1">Số câu đúng</p>
            </div>
            <div className="border-l border-slate-200 h-12"></div>
            <div>
              <span className="text-4xl font-black text-gray-800">{Math.round((calculateScore() / LISTENING_SIZE) * 100)}%</span>
              <p className="text-sm text-slate-500 mt-1">Độ chính xác</p>
            </div>
          </div>

          <button 
            onClick={() => initListening(allVocab)}
            className="px-7 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Làm lượt ôn tập mới
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-6">
            <span>Câu hỏi ôn tập {currentIndex + 1} / {LISTENING_SIZE}</span>
            <span>Đã hoàn thành: {Object.keys(selectedAnswers).length}/{LISTENING_SIZE}</span>
          </div>

          {/* Khung Audio - Không hiển thị chữ Hán câu hỏi */}
          <div className="mb-8 text-center bg-blue-50/40 p-8 rounded-3xl border border-blue-100 flex flex-col items-center">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Lắng nghe đoạn phát âm và chọn chữ Hán tương ứng:</span>
            
            <button
              onClick={() => playAudio(currentQ.word)}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all duration-300 cursor-pointer ${
                isPlaying 
                  ? "bg-blue-600 text-white animate-pulse scale-105 shadow-blue-200" 
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
              }`}
              title="Nghe lại"
            >
              {isPlaying ? "🔊" : "▶️"}
            </button>
            <p className="text-xs text-blue-500 font-medium mt-4">
              {isPlaying ? "Đang phát âm..." : "Nhấn vào nút để nghe lại âm thanh"}
            </p>
          </div>

          {/* Các lựa chọn đáp án hiển thị Chữ Hán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = userSelected === option;
              const isCorrect = option === currentQ.correctAnswer;

              let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/30";
              let badgeStyle = "bg-slate-100 text-slate-500";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm";
                  badgeStyle = "bg-emerald-600 text-white";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-red-50 border-red-500 text-red-900 font-bold shadow-sm";
                  badgeStyle = "bg-red-600 text-white";
                } else {
                  btnStyle = "bg-white border-slate-100 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 rounded-2xl border text-left text-base font-bold transition flex items-center gap-3 ${
                    isAnswered ? "cursor-default" : "cursor-pointer"
                  } ${btnStyle}`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${badgeStyle}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-xl">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Hiển thị kết quả kèm Pinyin và Nghĩa ngắn gọn ngay sau khi chọn */}
          {isAnswered && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-medium flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn ${
              userSelected === currentQ.correctAnswer ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <div>
                {userSelected === currentQ.correctAnswer ? "✨ Chính xác rất tốt!" : "❌ Chưa chính xác!"}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/90 px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left">
                <span className="text-xs text-slate-500 font-medium">[{currentQ.pinyin}]</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="text-xs text-blue-700 font-semibold">{currentQ.meaning}</span>
              </div>
            </div>
          )}

          {/* Điều hướng */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition cursor-pointer ${
                currentIndex === 0 
                  ? "opacity-40 border-slate-100 text-slate-300 cursor-not-allowed" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              ← Câu trước
            </button>

            {currentIndex < LISTENING_SIZE - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-7 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-sm shadow-md hover:bg-emerald-700 transition cursor-pointer"
              >
                Xem tổng kết ôn tập ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}