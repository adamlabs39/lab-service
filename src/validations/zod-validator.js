import BadRequestException from "../exception/bad-request-exception.js";

export default class ZodValidator {
  static validate(schema, data) {
    try {
      return schema.parse(data);
    } catch (error) {
      const errorMessages = error.errors.map((error) => {
        return `${error.message}`;
      });
      throw new BadRequestException(errorMessages);
    }
  }
}
