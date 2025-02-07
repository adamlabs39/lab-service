import * as XLSX from "xlsx";

const parseExcelToJSON =(req, sheetOrder = 0) => {
    
    const file = req.files?.files || null;
    const availableMimeTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!file) {
        throw new BadRequestException("kunci 'files' tidak ditemukan");
    }

    if (!availableMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException("file bukan excel");
    }

    const wb = XLSX.read(file.data, {type: 'buffer'});
    const sheet = wb.Sheets[wb.SheetNames[sheetOrder]];

    return XLSX.utils.sheet_to_json(sheet, {raw: true, defval: null});
}

export default parseExcelToJSON;