import { z } from "zod";

export default class HasilPemeriksaanValidation {
    static INPUT_HASIL_PEMERIKSAAN = z.object(
        {
            order_lab_uuid: z.string().uuid(),
            faskes_uuid: z.string().min(1),
            hasil_pemeriksaan: z.array(z.object({
                observation_item_uuid: z.string().uuid(),
                result : z.string().min(1).max(255),
            })),
        }
    )
}