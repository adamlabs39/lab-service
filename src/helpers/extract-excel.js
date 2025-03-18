import excel from 'exceljs';

const extractExcel = async (filePath) => {
    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(filePath)
    return workbook.worksheets[0]
}

export default extractExcel;