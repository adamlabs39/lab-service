import { z } from "zod";

export default class CategoryPemeriksaanValidation {
  static CREATE = z.object({
    code: z
      .string({
        required_error: "Data gagal disimpan, Code harus diisi",
        invalid_type_error: "Data gagal disimpan, Code harus bernilai string",
      })
      .min(1, {
        message: "Data gagal disimpan, Code harus diisi",
      })
      .max(255),
    name: z
      .string({
        required_error: "Data gagal disimpan, Name harus diisi",
        invalid_type_error: "Data gagal disimpan, Name harus bernilai string",
      })
      .min(1, {
        message: "Data gagal disimpan, Name harus diisi",
      })
      .max(255),
    no_urut: z
      .number({
        required_error: "Data gagal disimpan, No. Urut harus diisi",
        invalid_type_error:
          "Data gagal disimpan, No. Urut harus bernilai angka",
      })
      .min(1),
    status: z.boolean(),
    faskes_uuid: z.string().min(1).max(255),
  });

  static IMPORT = z.array(this.CREATE);

  static UPDATE = z.object({
    code: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    no_urut: z.number().min(1),
    status: z.boolean(),
    faskes_uuid: z.string().min(1).max(255),
  });
}
