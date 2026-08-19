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

        // Dựa đúng vào hình ảnh Excel thực tế của bạn:
        // Cột D (index 3): 等級 (Cấp độ)
        // Cột C (index 2): 詞語 (Chữ Hán)
        // Cột K (index 10 hoặc 11 tùy dòng): 參考漢語拼音 (Pinyin)
        // Cột L (index 11 hoặc 12): definition (Nghĩa)
        const rawLevel = String(row[3] || "").trim();
        const word = String(row[2] || "").trim();      // Cột C: Chữ Hán chính xác
        const pinyin = String(row[10] || row[9] || "").trim(); 
        const meaning = String(row[11] || row[12] || "").trim();

        if (!word) continue;

        // Phân loại Band chuẩn xác theo chữ tiếng Trung
        let level = "Band A";
        if (rawLevel.includes("進階") || rawLevel.includes("B") || rawLevel.includes("中")) {
            level = "Band B";
        } else if (rawLevel.includes("高階") || rawLevel.includes("C") || rawLevel.includes("高級")) {
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

    console.log(`✅ Thành công! Đã trích xuất ${formattedData.length} từ vựng chuẩn xác.`);

} catch (err) {
    console.error('❌ Lỗi:', err.message);
}