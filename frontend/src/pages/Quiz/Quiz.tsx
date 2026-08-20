import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

interface QuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const QUESTION_COUNT = 10;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    async function loadQuizData() {
      try {
        const response = await fetch("/TOCFL_14425_word_list.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        // Lọc dữ liệu hợp lệ
        const formattedData = rawData
          .slice(1)
          .map((row) => ({
            word: String(row[2] || "").trim(),
            pinyin: String(row[10] || "").trim(),
            meaning: String(row[11] || "").trim(),
          }))
          .filter((item) => item.word !== "" && item.meaning !== "");

        if (formattedData.length < 4) {
          setLoading(false);
          return;
        }

        // Tạo danh sách câu hỏi trắc nghiệm từ từ vựng
        const shuffledList = shuffleArray(formattedData);
        const selectedBatch = shuffledList.slice(0, QUESTION_COUNT);

        const generatedQuestions: QuestionItem[] = selectedBatch.map((target) => {
          // Lấy 3 đáp án sai ngẫu nhiên
          const wrongPool = formattedData.filter(
            (item) => item.word !== target.word
          );
          const wrongSamples = shuffleArray(wrongPool).slice(0, 3);

          // Trộn đáp án đúng cùng 3 đáp án sai
          const optionsPool = shuffleArray([
            target.meaning,
            ...wrongSamples.map((item) => item.meaning),
          ]);

          const correctIdx = optionsPool.indexOf(target.meaning);

          return {
            question: `Từ "${target.word}" (${target.pinyin}) có nghĩa là gì?`,
            options: optionsPool,
            correctIndex: correctIdx,
            explanation: `Từ "${target.word}" có pinyin là "${target.pinyin}", nghĩa chuẩn là: ${target.meaning}`,
          };
        });

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc dữ liệu trắc nghiệm:", error);
        setLoading(false);
      }
    }

    loadQuizData();
  }, []);

  // Hàm đồng bộ tiến độ làm bài lên Backend MongoDB
  const syncQuizProgressToBackend = async () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      try {
        await axios.post("http://localhost:5000/api/dashboard/daily-progress", {
          userId,
          type: "quiz",
          increment: 1,
        });
        console.log("✅ Đã cập nhật +1 bài trắc nghiệm vào MongoDB!");
      } catch (err) {
        console.error("❌ Lỗi đồng bộ trắc nghiệm với MongoDB:", err);
      }
    }
  };

  // Hàm ghi nhận kết quả vào localStorage khi hoàn thành
  const handleRecordQuizComplete = (finalScore: number) => {
    try {
      const todayQuizCount = parseInt(
        localStorage.getItem("today_quiz_count") || "0"
      );
      localStorage.setItem("today_quiz_count", (todayQuizCount + 1).toString());

      const oldActivities = JSON.parse(
        localStorage.getItem("recent_activities") || "[]"
      );
      const newActivity = {
        title: "Hoàn thành Luyện Trắc Nghiệm",
        time:
          "Hôm nay, " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        result: `Đạt ${finalScore}/${questions.length} câu`,
      };
      const updatedActivities = [newActivity, ...oldActivities].slice(0, 5);
      localStorage.setItem(
        "recent_activities",
        JSON.stringify(updatedActivities)
      );
    } catch (e) {
      console.error("Lỗi lưu tiến độ vào localStorage:", e);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === questions[currentIndex].correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const finalScore =
        selectedOption === questions[currentIndex].correctIndex
          ? score
          : score;
      handleRecordQuizComplete(finalScore);
      syncQuizProgressToBackend();
    }
  };

  const handleRestartQuiz = () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);

    // Load lại bộ câu hỏi ngẫu nhiên mới
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Đang tạo bộ câu hỏi trắc nghiệm...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 font-medium">
        Không đủ dữ liệu để tạo bài trắc nghiệm.
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(
    ((currentIndex + 1) / questions.length) * 100
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Luyện Tập Trắc Nghiệm
        </h1>
        <p className="text-gray-500 mt-1">
          Kiểm tra vốn từ vựng tiếng Trung qua bộ {questions.length} câu hỏi ngẫu nhiên
        </p>
      </div>

      {!isFinished ? (
        <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
              <span>
                Câu hỏi {currentIndex + 1} / {questions.length}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-6">
            {currentQ.options.map((option, idx) => {
              let btnStyle =
                "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = "bg-green-100 border-green-500 text-green-800 font-bold";
                } else if (idx === selectedOption) {
                  btnStyle = "bg-red-100 border-red-500 text-red-800 font-bold";
                } else {
                  btnStyle = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left font-medium transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>
                    <strong className="mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </strong>{" "}
                    {option}
                  </span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <span className="text-green-600 text-sm font-bold">✓ Đúng</span>
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <span className="text-red-600 text-sm font-bold">✗ Sai</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next */}
          {isAnswered && (
            <div className="animate-fadeIn">
              {currentQ.explanation && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-xs sm:text-sm text-slate-600">
                  <strong className="text-slate-800">Giải thích: </strong>
                  {currentQ.explanation}
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 bg-red-600 text-white font-bold rounded-2xl shadow-md hover:bg-red-700 transition cursor-pointer"
              >
                {currentIndex + 1 < questions.length
                  ? "Câu tiếp theo ➔"
                  : "Xem kết quả 🎉"}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Result Screen */
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fadeIn">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border border-red-100">
            {Math.round((score / questions.length) * 100)}%
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {score === questions.length
              ? "Xuất sắc! 🎉"
              : score >= questions.length / 2
              ? "Làm tốt lắm! 👍"
              : "Cố gắng hơn nhé! 💪"}
          </h2>

          <p className="text-gray-600 mb-6">
            Bạn đã trả lời đúng{" "}
            <span className="font-bold text-red-600">
              {score}/{questions.length}
            </span>{" "}
            câu hỏi.
          </p>

          <button
            onClick={handleRestartQuiz}
            className="w-full py-3.5 bg-red-600 text-white font-bold rounded-2xl shadow-md hover:bg-red-700 transition cursor-pointer"
          >
            Làm bài trắc nghiệm mới
          </button>
        </div>
      )}
    </div>
  );
}