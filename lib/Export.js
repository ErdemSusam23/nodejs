const ExcelJS = require('exceljs');

class Export {
    constructor() {}

    /**
     * Excel dosyası oluşturur ve response'a yazar.
     * @param {Array} columns - Sütun başlıkları [{ header: 'Ad', key: 'first_name', width: 10 }]
     * @param {Array} data - Veri listesi
     * @param {String} sheetName - Sayfa adı
     * @param {Object} res - Express Response objesi
     */
    async toExcel(columns, data, sheetName, res) {
        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet(sheetName);

        // Sütunları ayarla
        worksheet.columns = columns;

        // Verileri ekle
        worksheet.addRows(data);

        // Header (Başlık) satırını stilize et (Kalın yap, arka plan rengi ver vs.)
        // İlk satırı (Header) al
        let headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.commit(); 

        // Response Header'larını ayarla (Excel dosyası olduğunu tarayıcıya bildir)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${sheetName}_${Date.now()}.xlsx`);

        // Dosyayı response'a yaz ve bitir
        await workbook.xlsx.write(res);
        res.end();
    }
}

module.exports = new Export();