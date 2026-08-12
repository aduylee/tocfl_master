const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFilePath = path.join(__dirname, 'TOCFL_14425_word_list.xlsx');

try {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const formattedData = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        let rawLevel = "";
        let word = "";
        let pinyin = "";
        let meaning = "";

        // Duyệt qua các cột trong dòng để tìm đúng dữ liệu dựa vào đặc điểm
        for (let j = 0; j < row.length; j++) {
            const val = String(row[j] || "").trim();
            // Tìm cột cấp độ chứa từ khóa cấp độ
            if (val.includes("基礎") || val.includes("進階") || val.includes("高階") || val.includes("Band")) {
                rawLevel = val;
            }
            // Tìm cột Pinyin (thường chứa các ký tự phiên âm kiểu Zhuyin hoặc Pinyin Latinh)
            if ((val.includes("ㄅ") || val.includes("ㄆ") || /^[a-zA-Z0-9\s/macēéěèàáǎāōóǒòīíǐìūúǔùüǖǘǚǜ]+$/.test(val)) && val.length < 20 && !pinyin && j > 5) {
                // Ưu tiên gán pinyin ở các cột phía sau
            }
        }

        // Dựa vào các cột cụ thể từ file Excel chuẩn của TOCFL 14425:
        // Cột D (index 3 hoặc tương đương) chứa cấp độ
        rawLevel = String(row[3] || row[2] || ""); 
        
        // Tìm chữ Hán thực sự: Duyệt tìm ô nào có chứa ký tự tiếng Trung (phồn thể) và độ dài từ 1-5 ký tự
        for (let j = 0; j < row.length; j++) {
            const cellVal = String(row[j] || "").trim();
            // Regex nhận diện chữ Hán
            if (/^[\u4e00-\u9fa5]+$/.test(cellVal) && cellVal.length <= 6) {
                word = cellVal;
                break;
            }
        }

        // Nếu vẫn không tìm thấy word bằng regex, lấy cột H (index 7) hoặc G (index 6) tùy dòng
        if (!word) {
            word = String(row[7] || row[6] || "").trim();
        }

        pinyin = String(row[10] || row[9] || "").trim();
        meaning = String(row[11] || row[12] || "").trim();

        if (!word || /^\d+$/.test(word)) continue; // Bỏ qua nếu word vẫn là số

        // Phân loại Band chính xác cho A, B, C
        let level = "Band A";
        if (rawLevel.includes("進階") || rawLevel.includes("B") || rawLevel.includes("中") || rawLevel.includes("Level 3") || rawLevel.includes("Level 4")) {
            level = "Band B";
        } else if (rawLevel.includes("高階") || rawLevel.includes("C") || rawLevel.includes("高級") || rawLevel.includes("Level 5")) {
            level = "Band C";
        }

        formattedData.push({
            id: formattedData.length + 1,
            word: word,
            pinyin: pinyin,
            meaning: meaning,
            level: level
        });
    }

    const outputDir = path.join(__dirname, '..', 'frontend', 'src', 'data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'allVocab.json');
    fs.writeFileSync(outputFile, JSON.stringify(formattedData, null, 2), 'utf8');

    console.log(`✅ Thành công! Đã trích xuất ${formattedData.length} từ vựng chuẩn xác có đủ Band A, B, C.`);

} catch (err) {
    console.error('❌ Lỗi:', err.message);
}