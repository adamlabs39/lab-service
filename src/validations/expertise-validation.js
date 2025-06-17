import { z } from "zod";

export default class ExpertiseValidation {
  static INPUT_EXPERTISE = z.object({
    catatan_expertise: z.string().min(1).max(255),
    order_lab_uuid: z.string().uuid(),
    petugas_expertise: z.string().min(1).max(255),
    faskes_uuid: z.string().min(1),
  });
}
