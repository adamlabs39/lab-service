import { z } from "zod";

export default class ItemPemeriksaanValidation {
  static CREATE = z
    .object({
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
      category_pemeriksaan_uuid: z.string().uuid(),
      metode: z.string().min(1).max(255).optional(),
      satuan: z.string().min(1).max(255).optional(),
      snomed_uuid: z.string().uuid().optional(),
      icd9_uuid: z.string().uuid().optional(),
      loinc_uuid: z.string().uuid(),
      status: z.boolean(),
      status_nilai_rujukan: z.boolean(),
      no_urut: z.number().min(1),
      faskes_uuid: z.string(),
      jenis_input: z.enum(["angka", "text", "pilihan", "long text"]),
      pilihan_hasil_item_pemeriksaans: z.array(z.string()).optional(),
    })
    .refine(
      (data) => {
        if (
          data.jenis_input === "pilihan" &&
          !data.pilihan_hasil_item_pemeriksaans
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          "pilihan_hasil_item_pemeriksaan_uuids is required for jenis_input pilihan",
        path: ["pisahan_hasil_item_pemeriksaans"],
      }
    );

  static UPDATE = z
    .object({
      code: z.string().min(1).max(255),
      name: z.string().min(1).max(255),
      category_pemeriksaan_uuid: z.string().uuid(),
      metode: z.string().min(1).max(255).optional(),
      satuan: z.string().min(1).max(255).optional(),
      snomed_uuid: z.string().uuid().optional(),
      icd9_uuid: z.string().uuid().optional(),
      loinc_uuid: z.string().uuid(),
      status: z.boolean(),
      status_nilai_rujukan: z.boolean(),
      no_urut: z.number().min(1),
      faskes_uuid: z.string(),
      jenis_input: z.enum(["angka", "text", "pilihan", "long text"]),
      pilihan_hasil_item_pemeriksaans: z.array(z.string()).optional(),
    })
    .refine(
      (data) => {
        if (
          data.jenis_input === "pilihan" &&
          !data.pilihan_hasil_item_pemeriksaans
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          "pilihan_hasil_item_pemeriksaan_uuids is required for jenis_input pilihan",
        path: ["pisahan_hasil_item_pemeriksaans"],
      }
    );
}
