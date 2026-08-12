import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface VocabItem {
  word: string;
  pinyin: string;
  meaning: string;
}

interface CardItem {
  id: number;
  text: string;
  type: 'word' | 'meaning';
  pairId: number;
}

export default function MatchGame() {
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [wordCards, setWordCards] = useState<CardItem[]>([]);
  const [meaningCards, setMeaningCards] = useState<CardItem[]>([]);
  
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [mistakes, setMistakes] = useState(0);
  const [wrongPair, setWrongPair] = useState<number[]>([]); // Lưu ID 2 thẻ chọn sai
  const [correctPair, setCorrectPair] = useState<number[]>([]); // Lưu ID 2 thẻ chọn đúng để tạo hiệu ứng xanh

  const GAME_SIZE = 4;
  const MAX_MISTAKES = 3;

  const shuffleArray = <T,>(array: T[]): T[] => {
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
        })).filter(item => item.word !== "" && item.meaning !== "");

        setAllVocab(formattedData);
        initGame(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc file Excel:", error);
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  const initGame = (vocabSource: VocabItem[]) => {
    if (vocabSource.length === 0) return;

    const validVocab = vocabSource.filter(item => item.meaning.length < 50);
    const selectedVocab = shuffleArray(validVocab).slice(0, GAME_SIZE);
    
    let wCards: CardItem[] = [];
    let mCards: CardItem[] = [];
    
    selectedVocab.forEach((item, index) => {
      wCards.push({
        id: index * 2,
        text: item.word,
        type: 'word',
        pairId: index,
      });
      mCards.push({
        id: index * 2 + 1,
        text: item.meaning,
        type: 'meaning',
        pairId: index,
      });
    });

    setWordCards(shuffleArray(wCards));
    setMeaningCards(shuffleArray(mCards));
    setSelectedCard(null);
    setMatchedPairs([]);
    setMistakes(0);
    setWrongPair([]);
    setCorrectPair([]);
    setGameState('playing');
  };

  const handleCardClick = (card: CardItem) => {
    // Chặn click nếu đang hiển thị hiệu ứng, thẻ đã ghép, hoặc đang game over/won
    if (wrongPair.length > 0 || correctPair.length > 0 || matchedPairs.includes(card.pairId) || selectedCard?.id === card.id || gameState !== 'playing') return;

    if (card.type === 'word') {
      speakWord(card.text);
    }

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      // Nếu bấm 2 thẻ cùng cột
      if (selectedCard.type === card.type) {
        setSelectedCard(card);
        return;
      }

      // Kiểm tra khớp pairId
      if (selectedCard.pairId === card.pairId) {
        const currentCorrect = [selectedCard.id, card.id];
        setCorrectPair(currentCorrect);
        setSelectedCard(null);

        setTimeout(() => {
          setCorrectPair([]);
          const newMatched = [...matchedPairs, card.pairId];
          setMatchedPairs(newMatched);

          if (newMatched.length === GAME_SIZE) {
            setGameState('won');
          }
        }, 500); // Hiệu ứng xanh trong 0.5 giây trước khi ẩn mờ
      } else {
        // Sai cặp -> Kích hoạt hiệu ứng đỏ
        const currentWrong = [selectedCard.id, card.id];
        setWrongPair(currentWrong);
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);

        setTimeout(() => {
          setWrongPair([]);
          setSelectedCard(null);
          if (newMistakes >= MAX_MISTAKES) {
            setGameState('lost');
          }
        }, 600);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500 font-medium">Đang tải trò chơi Nối từ...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Trò chơi Nối từ (Matching Game)</h1>
        <p className="text-gray-500 mt-1">Ghép chữ Hán cột trái với nghĩa tiếng Việt cột phải</p>
      </div>

      {gameState !== 'playing' ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fadeIn">
          {gameState === 'won' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Xuất sắc! 🎉</h2>
              <p className="text-gray-600 mb-6">Bạn đã ghép đúng toàn bộ các cặp từ vựng.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over! 😢</h2>
              <p className="text-gray-600 mb-6">Bạn đã vượt quá giới hạn 3 lần sai cho phép.</p>
            </>
          )}

          <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-center">
            <span className="text-4xl font-black text-red-600">{mistakes}/{MAX_MISTAKES}</span>
            <p className="text-sm text-slate-500 mt-2">Tổng số lỗi sai</p>
          </div>
          <button 
            onClick={() => initGame(allVocab)}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl shadow-md hover:bg-red-700 transition cursor-pointer"
          >
            Chơi ván mới
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-between w-full max-w-2xl px-2 text-xs font-semibold text-gray-500 mb-4">
            <span>Đã ghép: {matchedPairs.length} / {GAME_SIZE}</span>
            <span className="text-red-600 font-bold">Số lỗi sai: {mistakes} / {MAX_MISTAKES} (Tối đa 3)</span>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mb-6">
            
            {/* Cột Trái: Chữ Hán */}
            <div className="flex flex-col gap-3">
              <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chữ Hán</div>
              {wordCards.map((card) => {
                const isMatched = matchedPairs.includes(card.pairId);
                const isSelected = selectedCard?.id === card.id;
                const isWrong = wrongPair.includes(card.id);
                const isCorrect = correctPair.includes(card.id);

                let cardStyle = "bg-white border-slate-200 text-slate-900 hover:border-red-300 hover:shadow-md";
                if (isMatched) {
                  cardStyle = "bg-green-50 border-green-200 text-green-300 opacity-40 cursor-not-allowed shadow-none";
                } else if (isCorrect) {
                  cardStyle = "bg-emerald-500 border-emerald-600 text-white font-bold scale-105 shadow-lg";
                } else if (isWrong) {
                  cardStyle = "bg-red-500 border-red-600 text-white font-bold animate-bounce shadow-lg";
                } else if (isSelected) {
                  cardStyle = "bg-red-600 border-red-700 text-white font-bold shadow-lg scale-102";
                }

                return (
                  <button
                    key={card.id}
                    disabled={isMatched}
                    onClick={() => handleCardClick(card)}
                    className={`min-h-[85px] p-4 rounded-2xl border text-xl font-bold flex items-center justify-center text-center transition-all duration-200 cursor-pointer ${cardStyle}`}
                  >
                    <span>{card.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Cột Phải: Nghĩa tiếng Việt */}
            <div className="flex flex-col gap-3">
              <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nghĩa tiếng Việt</div>
              {meaningCards.map((card) => {
                const isMatched = matchedPairs.includes(card.pairId);
                const isSelected = selectedCard?.id === card.id;
                const isWrong = wrongPair.includes(card.id);
                const isCorrect = correctPair.includes(card.id);

                let cardStyle = "bg-white border-slate-200 text-slate-800 hover:border-red-300 hover:shadow-md";
                if (isMatched) {
                  cardStyle = "bg-green-50 border-green-200 text-green-300 opacity-40 cursor-not-allowed shadow-none";
                } else if (isCorrect) {
                  cardStyle = "bg-emerald-500 border-emerald-600 text-white font-bold scale-105 shadow-lg";
                } else if (isWrong) {
                  cardStyle = "bg-red-500 border-red-600 text-white font-bold animate-bounce shadow-lg";
                } else if (isSelected) {
                  cardStyle = "bg-red-600 border-red-700 text-white font-bold shadow-lg scale-102";
                }

                return (
                  <button
                    key={card.id}
                    disabled={isMatched}
                    onClick={() => handleCardClick(card)}
                    className={`min-h-[85px] p-4 rounded-2xl border text-sm md:text-base font-medium flex items-center justify-center text-center transition-all duration-200 cursor-pointer ${cardStyle}`}
                  >
                    <span className="line-clamp-3">{card.text}</span>
                  </button>
                );
              })}
            </div>

          </div>

          <button 
            onClick={() => initGame(allVocab)}
            className="text-xs font-semibold text-gray-500 hover:text-red-600 transition cursor-pointer mt-2"
          >
            Làm mới bàn chơi
          </button>
        </div>
      )}
    </div>
  );
}