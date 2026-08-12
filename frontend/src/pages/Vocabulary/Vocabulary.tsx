import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

interface VocabItem {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
}

export default function Vocabulary() {
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    async function loadVocab() {
      try {
        const response = await fetch("/TOCFL_14425_word_list.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Đã sửa map cột: 
        // Index 2 (Cột C) là Chữ Hán, Index 10 (Cột K) là Pinyin, Index 11 (Cột L) là Nghĩa
        const formattedData: VocabItem[] = rawData.slice(1).map((row, index) => ({
          id: String(index),
          word: String(row[2] || ""), 
          pinyin: String(row[10] || ""),
          meaning: String(row[11] || ""),
        })).filter(item => item.word.trim() !== "");

        setVocabList(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi đọc file:", error);
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  // Lọc tìm kiếm đơn giản: chỉ kiểm tra Chữ Hán, Pinyin hoặc Nghĩa
  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return vocabList;

    return vocabList.filter((item) => 
      item.word.toLowerCase().includes(search) ||
      item.pinyin.toLowerCase().includes(search) ||
      item.meaning.toLowerCase().includes(search)
    );
  }, [vocabList, searchTerm]);

  const paginatedData = filteredData.slice(0, currentPage * itemsPerPage);

  if (loading) return <div className="text-center py-20">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Thư viện Từ vựng ({vocabList.length} từ)</h1>
      
      <input
        type="text"
        placeholder="Tìm kiếm chữ Hán, Pinyin hoặc nghĩa..."
        className="w-full px-4 py-3 mb-8 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-500"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <h2 className="text-3xl font-black mb-2 text-gray-900">{item.word}</h2>
            <p className="text-sm font-medium text-gray-600 mb-3">{item.pinyin}</p>
            <p className="text-gray-500 text-sm border-t pt-3">{item.meaning}</p>
          </div>
        ))}
      </div>

      {paginatedData.length < filteredData.length && (
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="block mx-auto mt-10 px-8 py-3 bg-red-600 text-white rounded-2xl font-bold"
        >
          Xem thêm
        </button>
      )}
    </div>
  );
}