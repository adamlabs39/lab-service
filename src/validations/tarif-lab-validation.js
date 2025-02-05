import { z } from "zod";

const komponenTidakanSchema = z.object({
    tarif_komponen_uuid : z.string().uuid(),
    diskon : z.number(),
    tarif_per_komponen : z.number().min(1),
})

const tarifItemSchema = z.object({
    kelompok_pemeriksaan_uuid : z.string().uuid().optional(),
    item_pemeriksaan_uuid : z.string().uuid().optional(),
    komponen_tindakan_labs : z.array(komponenTidakanSchema)
})

export default class TarifLabValidation {
    static CREATE = z.object({
        code: z.string().min(1).max(255),
        name: z.string().min(1).max(255),
        pelayanans : z.array(z.enum(["igd","rajal","ranap","aps"])),
        penjamin_uuids: z.array(z.string().uuid()),
        tarif_lab_items : z.array(tarifItemSchema),
        status: z.boolean(),
        faskes_uuid : z.string(),
        grand_total: z.number().min(1)
    });
    static UPDATE = z.object({
        code: z.string().min(1).max(255),
        name: z.string().min(1).max(255),
        pelayanans : z.array(z.enum(["igd","rajal","ranap","aps"])),
        penjamin_uuids: z.array(z.string().uuid()),
        tarif_lab_items : z.array(tarifItemSchema),
        status: z.boolean(),
        faskes_uuid : z.string(),
        grand_total: z.number().min(1)
    });
}