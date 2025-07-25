import { z } from "zod";
import PatientValidation from "./patient-vaidation.js";

export default class OrderLabValidation {
  static CREATE = z
    .object({
      patient_uuid: z.string().max(255).nullable().optional(),
      patient: PatientValidation.CREATE.nullable().optional(),
      no_rm: z.string().min(1).max(255),
      rekam_medis_date: z.string().nullable().optional(),
      payment_method: z.number().min(1).max(2),
      penjamin_uuid: z.string().uuid().nullable().optional(),
      pelayanan: z.enum(["rajal", "ranap", "igd", "aps"]),
      lokasi_uuid: z.string().uuid(),
      dokter_pengirim_uuid: z.string().uuid().optional(),
      dokter_pengirim: z.string().max(255).nullable().optional(),
      pasien_maternitas: z.boolean(),
      keluhan_utama: z.string().max(255).nullable().optional(),
      catatan: z.string().max(255).nullable().optional(),
      diagnosis: z.string().max(255).nullable().optional(),
      tgl_pemeriksaan: z.string().min(1),
      cito: z.boolean(),
      status_puasa: z.boolean(),
      petugas_order: z.string().min(1).max(255),
      tarif_lab_uuids: z.array(z.string().uuid()),
      faskes_uuid: z.string().min(1),
      is_mcu: z.boolean(),
    })
    .refine(
      (data) => {
        if (!data.dokter_pengirim && !data.dokter_pengirim_uuid) {
          return false;
        }
        return true;
      },
      {
        message: "Dokter pengirim harus diisi",
        path: ["dokter_pengirim"],
      }
    )
    .refine(
      (data) => {
        if (data.payment_method == 2 && !data.penjamin_uuid) {
          return false;
        }
        return true;
      },
      {
        message: "Penjamin harus diisi",
        path: ["penjamin_uuid"],
      }
    )
    .refine(
      (data) => {
        if (!data.patient_uuid && !data.patient) {
          return false;
        }
        return true;
      },
      {
        message: "Pasien harus diisi",
        path: ["patient"],
      }
    );

  static UPDATE = z.object({
    tgl_pemeriksaan: z.string().min(1),
    cito: z.boolean(),
    status_puasa: z.boolean(),
    tarif_lab_uuids: z.array(z.string().uuid()),
    faskes_uuid: z.string().min(1),
  });

  static BATAL_ORDER = z.object({
    alasan_batal_order: z.string().min(1).max(255),
    order_lab_uuids: z.array(z.string().uuid()),
    faskes_uuid: z.string().min(1),
  });

  static BATAL_VALIDASI = z.object({
    alasan_batal_validasi: z.string().min(1).max(255),
    order_lab_uuids: z.array(z.string().uuid()),
    faskes_uuid: z.string().min(1),
  });

  static VALIDASI = z.object({
    faskes_uuid: z.string().min(1),
    spesimen_uuids: z.array(z.string().uuid()).optional(),
    practitioner_uuid: z.string().uuid(),
  });
}
