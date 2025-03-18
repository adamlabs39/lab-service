import BadRequestException from "../exception/bad-request-exception.js";

const validateExcel = (file) => {
  const allowedExtensions = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];;
  if (!allowedExtensions.includes(file.mimetype)) {
    throw new BadRequestException("File harus berupa excel");
  }
}

export default validateExcel;