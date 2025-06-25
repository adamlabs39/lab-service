import { z } from "zod";
import PageValidation from "./page-validation.js";

export default class Laporanvalidation {
  static GET_KUNJUNGAN = z.object({
    faskes_uuid: z.string().min(1).max(255),
    start_date: z.string().min().max(255).optional(),
    end_date: z.string().min().max(255).optional(),
    search: z.string().min().max(255).optional(),
    pelayanan: z
      .string()
      .transform((val) => (val === "" ? null : val))
      .pipe(z.enum(["rajal", "ranap", "igd", "aps"]).nullable().optional()),
    ...PageValidation.PAGINATION.shape,
  });
  static GET_REKAP_KUNJUNGAN = z.object({
    faskes_uuid: z.string().min(1).max(255),
    start_date: z.string().min().max(255).optional(),
    end_date: z.string().min().max(255).optional(),
    search: z.string().min().max(255).optional(),
    ...PageValidation.PAGINATION.shape,
  });
}
