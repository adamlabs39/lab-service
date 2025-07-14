import { z } from "zod";

export default class SpesimenValidation {
  static CREATE = z.object({
    code: z
      .string({
        required_error: "Data gagal disimpan, Code harus diisi",
        invalid_type_error: "Data gagal disimpan, Code harus bernilai string",
      })
      .min(1, {
        message: "Data gagal disimpan, Code harus diisi",
      })
      .max(255)
      .toUpperCase(),
    name: z
      .string({
        required_error: "Data gagal disimpan, Name harus diisi",
        invalid_type_error: "Data gagal disimpan, Code harus bernilai string",
      })
      .min(1, {
        message: "Data gagal disimpan, Name harus diisi",
      })
      .max(255),
    status: z.boolean(),
    faskes_uuid: z.string().min(1).max(255),
  });

  static UPDATE = z.object({
    code: z.string().min(1).max(255).toUpperCase(),
    name: z.string().min(1).max(255),
    status: z.boolean(),
    faskes_uuid: z.string().min(1).max(255),
  });
}
