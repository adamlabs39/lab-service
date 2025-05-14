import { z } from "zod";

const komponenTidakanSchema = z.object({
  tarif_komponen_uuid: z.string().uuid(),
  prosentase_per_komponen: z.number().optional(),
  tarif_per_komponen: z.number().min(1),
});

const tarifItemSchema = z.object({
  kelompok_pemeriksaan_uuid: z.string().uuid().optional(),
  item_pemeriksaan_uuid: z.string().uuid().optional(),
  komponen_tindakan_labs: z.array(komponenTidakanSchema),
  total_tarif: z.number().min(1),
});

export default class TarifLabValidation {
  static CREATE = z.object({
    code: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    pelayanans: z
      .array(z.enum(["igd", "rajal", "ranap", "aps"]))
      .nonempty("Pelayanans tidak boleh kosong"),
    penjamin_uuids: z
      .array(z.string().uuid())
      .nonempty("Penjamin tidak boleh kosong"),
    tarif_lab_items: z
      .array(tarifItemSchema)
      .nonempty("Tarif lab items tidak boleh kosong"),
    status: z.boolean(),
    faskes_uuid: z.string(),
    grand_total: z.number().min(1),
    presentase: z.boolean(),
  });
  static UPDATE = z.object({
    code: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    pelayanans: z.array(z.enum(["igd", "rajal", "ranap", "aps"])),
    penjamin_uuids: z.array(z.string().uuid()),
    tarif_lab_items: z.array(tarifItemSchema),
    status: z.boolean(),
    faskes_uuid: z.string(),
    grand_total: z.number().min(1),
    presentase: z.boolean(),
  });
}
