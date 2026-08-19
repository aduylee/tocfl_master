import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

interface VocabItem {
  word: string;
  pinyin: string;
  meaning: string;
}

export default function Flashcard() {
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [sessionVocab, setSessionVocab] = useState<VocabItem[]>([]);
  const [reviewVocab, setReviewVocab] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  
  // Trạng thái cho phép bật/tắt tự động phát âm thanh
  const [autoPlaySound, setAutoPlaySound] = useState(true);
  const BATCH_SIZE = 20;

  const shuffleArray = (array: VocabItem[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
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
        })).filter(item => item.word !== "");

        setAllVocab(formattedData);
        
        const shuffled = shuffleArray(formattedData);
        setSessionVocab(shuffled.slice(0, BATCH_SIZE));
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc file Excel:", error);
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  useEffect(() => {
    if (sessionVocab.length > 0 && !isFinished && autoPlaySound) {
      setIsFlipped(false);
      speakWord(sessionVocab[currentIndex].word);
    }
  }, [currentIndex, sessionVocab, isFinished, autoPlaySound]);

  // Hàm đồng bộ dữ liệu vừa thuộc về Backend MongoDB
  const syncVocabToBackend = async (countToAdd: number) => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      try {
        await axios.post("http://localhost:5000/api/dashboard/vocab-learned", {
          userId,
          count: countToAdd,
        });
        console.log(`✅ Đã cập nhật +${countToAdd} từ vựng vào MongoDB!`);
      } catch (err) {
        console.error("❌ Lỗi đồng bộ từ vựng với MongoDB:", err);
      }
    }
  };

  // Hàm ghi nhận kết quả hoàn thành phiên học vào localStorage và Server
  const handleRecordSessionComplete = (totalLearned: number) => {
    try {
      // 1. Cộng dồn tổng số từ vựng đã thuộc ở localStorage
      const currentTotal = parseInt(localStorage.getItem("learned_vocab_count") || "0");
      const newTotal = currentTotal + totalLearned;
      localStorage.setItem("learned_vocab_count", newTotal.toString());

      // 2. Cộng dồn mục tiêu từ vựng trong ngày
      const todayCount = parseInt(localStorage.getItem("today_vocab_count") || "0");
      localStorage.setItem("today_vocab_count", (todayCount + totalLearned).toString());

      // 3. Thêm vào hoạt động gần đây
      const oldActivities = JSON.parse(localStorage.getItem("recent_activities") || "[]");
      const newActivity = {
        title: "Ôn tập Flashcard",
        time: "Hôm nay, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: `+${totalLearned} từ vựng`
      };
      const updatedActivities = [newActivity, ...oldActivities].slice(0, 5);
      localStorage.setItem("recent_activities", JSON.stringify(updatedActivities));
    } catch (e) {
      console.error("Lỗi lưu tiến độ vào localStorage", e);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải dữ liệu Flashcard...</div>;
  }

  if (sessionVocab.length === 0) {
    return <div className="text-center py-20 text-gray-500 font-medium">Không tìm thấy dữ liệu từ vựng.</div>;
  }

  const currentItem = sessionVocab[currentIndex];

  const handleRemembered = () => {
    setIsFlipped(false);
    const newLearnedCount = learnedCount + 1;
    setLearnedCount(newLearnedCount);
    
    // Gửi tăng 1 từ lên MongoDB ngay khi người dùng nhấn "Nhớ rồi"
    syncVocabToBackend(1);

    if (currentIndex + 1 < sessionVocab.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (reviewVocab.length > 0) {
        setSessionVocab(reviewVocab);
        setReviewVocab([]);
        setCurrentIndex(0);
      } else {
        setIsFinished(true);
        handleRecordSessionComplete(newLearnedCount); // Lưu kết quả tổng hợp vào localStorage
      }
    }
  };

  const handleForgot = () => {
    setIsFlipped(false);

    const updatedReview = [...reviewVocab, currentItem];
    setReviewVocab(updatedReview);

    try {
      const existingForgot = JSON.parse(localStorage.getItem("forgot_vocab_list") || "[]");
      if (!existingForgot.some((item: VocabItem) => item.word === currentItem.word)) {
        const newForgotList = [...existingForgot, currentItem];
        localStorage.setItem("forgot_vocab_list", JSON.stringify(newForgotList));
      }
    } catch (e) {
      console.error("Lỗi lưu localStorage", e);
    }

    if (currentIndex + 1 < sessionVocab.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionVocab(updatedReview);
      setReviewVocab([]);
      setCurrentIndex(0);
    }
  };

  const loadRandomNewBatch = () => {
    const shuffled = shuffleArray(allVocab);
    setSessionVocab(shuffled.slice(0, BATCH_SIZE));
    setCurrentIndex(0);
    setIsFinished(false);
    setReviewVocab([]);
    setLearnedCount(0);
  };

  const progressPercent = Math.min(100, Math.round((currentIndex / sessionVocab.length) * 100));

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Luyện tập Flashcard (Random 20 từ)</h1>
        <p className="text-gray-500 mt-1">Luyện tập từ vựng tiếng Trung với âm thanh và ghi nhớ thông minh</p>
      </div>

      {/* Thanh tùy chỉnh (Cài đặt nhanh) và Tiến độ */}
      {!isFinished && (
        <div className="w-full max-w-md mb-4 flex flex-col gap-3">
          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-600">🔊 Tự động phát âm khi chuyển từ</span>
            <button 
              onClick={() => setAutoPlaySound(!autoPlaySound)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${autoPlaySound ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${autoPlaySound ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>Tiến độ phiên học</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all duration-300 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {isFinished ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tuyệt vời! 🎉</h2>
          <p className="text-gray-600 mb-6">Bạn đã hoàn thành xuất sắc phiên học này và ôn lại toàn bộ các từ chưa thuộc.</p>
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 text-sm text-slate-600 flex justify-around">
            <div>
              <p className="font-bold text-lg text-red-600">{learnedCount}</p>
              <p>Đã tiếp thu</p>
            </div>
            <div className="border-r border-slate-200"></div>
            <div>
              <p className="font-bold text-lg text-slate-800">{BATCH_SIZE}</p>
              <p>Tổng số từ</p>
            </div>
          </div>
          <button 
            onClick={loadRandomNewBatch}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl shadow-md hover:bg-red-700 transition cursor-pointer"
          >
            Lấy 20 từ ngẫu nhiên khác
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000 mb-8"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d shadow-xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`}>
              
              {/* Mặt trước */}
              <div className="absolute inset-0 w-full h-full bg-slate-100 rounded-3xl flex flex-col items-center justify-between p-8 border border-slate-200 backface-hidden">
                <div className="flex flex-row items-center justify-center gap-2 text-6xl font-black text-slate-900 my-auto">
                  {currentItem.word.split("").map((char, index) => (
                    <span key={index}>{char}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentItem.word);
                    }}
                    className="text-red-600 text-xs font-semibold px-3 py-1.5 bg-red-50 rounded-full border border-red-100 hover:bg-red-100 transition cursor-pointer"
                  >
                    🔊 Bấm để nghe
                  </button>
                  <span className="text-slate-400 text-xs italic">Nhấn thẻ để xem nghĩa</span>
                </div>
              </div>
              
              {/* Mặt sau */}
              <div className="absolute inset-0 w-full h-full bg-red-600 rounded-3xl flex flex-col items-center justify-center p-8 text-white backface-hidden rotate-y-180">
                <div className="flex flex-row items-center justify-center gap-2 text-4xl font-black mb-3">
                  {currentItem.word.split("").map((char, index) => (
                    <span key={index}>{char}</span>
                  ))}
                </div>
                <span className="text-xl font-bold mb-3 opacity-95">{currentItem.pinyin}</span>
                <span className="text-sm opacity-95 text-center leading-relaxed">{currentItem.meaning}</span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(currentItem.word);
                  }}
                  className="mt-4 px-4 py-1.5 bg-white text-red-600 text-xs font-bold rounded-full shadow hover:bg-red-50 transition cursor-pointer"
                >
                  🔊 Nghe lại
                </button>
              </div>

            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={handleRemembered} 
              className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-md hover:bg-red-700 transition cursor-pointer"
            >
              Nhớ rồi
            </button>
            <button 
              onClick={handleForgot} 
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-300 transition cursor-pointer"
            >
              Quên (Ôn lại)
            </button>
          </div>

          <div className="mt-4 flex justify-between w-full px-2 text-sm text-gray-400 font-medium">
            <span>Từ {currentIndex + 1} / {sessionVocab.length}</span>
            {reviewVocab.length > 0 && <span className="text-red-500 font-semibold">Đang ôn lại ({reviewVocab.length} từ)</span>}
          </div>
        </div>
      )}
    </div>
  );
}