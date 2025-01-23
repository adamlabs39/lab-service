import { z } from "zod";

export default class ItemPemeriksaanValidation {
    static CREATE = z.object({
        code : z.string().min(1).max(255),
        metode : z.string().min(1).max(255),
        satuan : z.string().min(1).max(255),
        senomed_uuid : z.string().min(1).max(255),
        icd9_uuid : z.string().min(1).max(255),
        ionic_uuid : z.string().min(1).max(255),
        status : z.boolean(),
        status_nilai_rujukan : z.boolean(),
        no_urut : z.number().min(1),
        jenis_input : z.enum(["angka", "text", "pilihan", "long text"]),
    }) 
}