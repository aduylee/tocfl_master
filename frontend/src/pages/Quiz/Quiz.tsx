import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface VocabItem {
  word: string;
  pinyin: string;
  meaning: string;
}

interface QuizQuestion {
  id: number;
  type: "listening" | "reading";
  word: string;
  pinyin: string;
  correctAnswer: string;
  options: string[];
}

export default function Quiz() {
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
  const [isPlaying, setIsPlaying] = useState(false);

  const QUIZ_SIZE = 30;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Phát âm thanh cho câu hỏi dạng Listening
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.75;
      
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
        initQuiz(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc file Excel:", error);
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  const initQuiz = (vocabSource: VocabItem[]) => {
    if (vocabSource.length === 0) return;

    const selectedVocab = shuffleArray(vocabSource).slice(0, QUIZ_SIZE);
    
    const list: QuizQuestion[] = selectedVocab.map((item, index) => {
      const type: "listening" | "reading" = Math.random() < 0.5 ? "listening" : "reading";

      const wrongOptions = shuffleArray(
        vocabSource.filter(v => v.meaning !== item.meaning)
      ).slice(0, 3).map(v => v.meaning);

      const options = shuffleArray([item.meaning, ...wrongOptions]);

      return {
        id: index,
        type,
        word: item.word,
        pinyin: item.pinyin,
        correctAnswer: item.meaning,
        options,
      };
    });

    setQuestions(list);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(600);
    setIsSubmitted(false);
  };

  // Đồng hồ đếm ngược 10 phút
  useEffect(() => {
    if (loading || isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, loading]);

  // Tự động phát âm nếu là câu hỏi Listening khi chuyển câu
  useEffect(() => {
    if (!loading && questions.length > 0 && !isSubmitted) {
      const currentQ = questions[currentIndex];
      if (currentQ.type === "listening") {
        playAudio(currentQ.word);
      }
    }
  }, [currentIndex, questions, isSubmitted]);

  const handleSelectOption = (option: string) => {
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

  // Hàm xử lý nộp bài và lưu kết quả đồng bộ lên Dashboard
  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const accuracy = Math.round((score / QUIZ_SIZE) * 100);

    try {
      // 1. Tăng số lượng bài thi đã hoàn thành
      const currentQuizzes = parseInt(localStorage.getItem("completed_quizzes_count") || "0");
      localStorage.setItem("completed_quizzes_count", (currentQuizzes + 1).toString());

      // 2. Tính toán độ chính xác trung bình tích lũy
      const oldAvg = parseFloat(localStorage.getItem("average_accuracy") || "0");
      const newAvg = currentQuizzes === 0 ? accuracy : Math.round((oldAvg * currentQuizzes + accuracy) / (currentQuizzes + 1));
      localStorage.setItem("average_accuracy", newAvg.toString());

      // 3. Cập nhật mục tiêu bài thi trong ngày (Today Quiz Count)
      const todayQuiz = parseInt(localStorage.getItem("today_quiz_count") || "0");
      localStorage.setItem("today_quiz_count", (todayQuiz + 1).toString());

      // 4. Thêm vào danh sách hoạt động gần đây
      const oldActivities = JSON.parse(localStorage.getItem("recent_activities") || "[]");
      const newActivity = {
        title: "Luyện thi / Quiz tổng hợp",
        time: "Hôm nay, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: `${score}/${QUIZ_SIZE} câu (${accuracy}%)`
      };
      const updatedActivities = [newActivity, ...oldActivities].slice(0, 5);
      localStorage.setItem("recent_activities", JSON.stringify(updatedActivities));
    } catch (e) {
      console.error("Lỗi lưu dữ liệu bài thi vào localStorage", e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải phòng thi tổng hợp...</div>;
  }

  const currentQ = questions[currentIndex];
  const userSelected = selectedAnswers[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[75vh] flex flex-col justify-center">
      {/* Header phòng thi */}
      <div className="mb-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 Phòng Thi Trực Tuyến (30 Câu - 10 Phút)</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kết hợp kiểm tra ngẫu nhiên kỹ năng Nghe hiểu & Đọc hiểu</p>
        </div>
        {!isSubmitted && (
          <div className={`px-4 py-2 rounded-2xl font-mono font-bold text-lg border ${
            timeLeft < 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-blue-50 text-blue-600 border-blue-100"
          }`}>
            ⏳ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {isSubmitted ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 text-center animate-fadeIn">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Kết Quả Bài Thi 🎯</h2>
          <p className="text-gray-500 mb-6">Bạn đã hoàn thành bài kiểm tra tổng hợp.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex justify-around items-center">
            <div>
              <span className="text-4xl font-black text-blue-600">{calculateScore()} / {QUIZ_SIZE}</span>
              <p className="text-sm text-slate-500 mt-1">Số câu đúng</p>
            </div>
            <div className="border-l border-slate-200 h-12"></div>
            <div>
              <span className="text-4xl font-black text-gray-800">{Math.round((calculateScore() / QUIZ_SIZE) * 100)}%</span>
              <p className="text-sm text-slate-500 mt-1">Độ chính xác</p>
            </div>
          </div>

          <button 
            onClick={() => initQuiz(allVocab)}
            className="px-7 py-3 mb-8 bg-blue-600 text-white font-bold rounded-2xl shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Làm bài thi mới
          </button>

          {/* HIỂN THỊ CHI TIẾT 30 CÂU Ở ĐÂY */}
          <div className="text-left border-t border-slate-100 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Chi Tiết Đáp Án:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                const isUnanswered = userAnswer === undefined;

                return (
                  <div key={index} className={`p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-sm text-gray-500">
                        Câu {index + 1} <span className="font-normal text-xs ml-1 bg-white px-2 py-0.5 rounded border shadow-sm">{q.type === 'listening' ? '🎧 Nghe' : '📖 Đọc'}</span>
                      </div>
                      <div className="text-lg">
                        {isCorrect ? "✅" : "❌"}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-xl font-black text-slate-900 mr-2">{q.word}</span>
                      <span className="text-sm text-slate-500 font-medium">[{q.pinyin}]</span>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className={`p-2 rounded-lg border ${isCorrect ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' : 'bg-red-100/50 border-red-200 text-red-800'}`}>
                        <span className="font-semibold">Bạn chọn:</span> {isUnanswered ? "Chưa chọn" : userAnswer}
                      </div>
                      
                      {!isCorrect && (
                        <div className="p-2 rounded-lg bg-emerald-100/50 border border-emerald-200 text-emerald-800">
                          <span className="font-semibold">Đáp án đúng:</span> {q.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-6">
            <span>Câu hỏi {currentIndex + 1} / {QUIZ_SIZE} ({currentQ.type === "listening" ? "🎧 Nghe hiểu" : "📖 Đọc hiểu"})</span>
            <span>Đã làm: {Object.keys(selectedAnswers).length}/{QUIZ_SIZE}</span>
          </div>

          {/* Nội dung hiển thị tùy thuộc vào dạng câu hỏi ngẫu nhiên */}
          {currentQ.type === "listening" ? (
            <div className="mb-8 text-center bg-blue-50/40 p-8 rounded-3xl border border-blue-100 flex flex-col items-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Lắng nghe âm thanh và chọn nghĩa đúng:</span>
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
          ) : (
            <div className="mb-8 text-center bg-blue-50/40 p-8 rounded-3xl border border-blue-100 flex flex-col items-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">CHỌN NGHĨA CHÍNH XÁC CỦA TỪ:</span>
              <div className="text-5xl font-black text-slate-900 tracking-wide my-3">{currentQ.word}</div>
              <div className="text-xs text-slate-500 font-medium">[{currentQ.pinyin}]</div>
            </div>
          )}

          {/* Các lựa chọn đáp án */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {currentQ.options.map((option, idx) => {
              const isSelected = userSelected === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 rounded-2xl border text-left text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                    isSelected 
                      ? "bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm" 
                      : "bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

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

            {currentIndex < QUIZ_SIZE - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-2xl text-sm shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-7 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-sm shadow-md hover:bg-emerald-700 transition cursor-pointer"
              >
                Nộp bài thi ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}