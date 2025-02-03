import { z } from "zod";

export default class ItemPemeriksaanValidation {
    static CREATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        category_pemeriksaan_uuid : z.string().uuid(),
        metode : z.string().min(1).max(255).optional(),
        satuan : z.string().min(1).max(255).optional(),
        snomed_uuid : z.string().uuid().optional(),
        icd9_uuid : z.string().uuid().optional(),
        loinc_uuid : z.string().uuid(),
        status : z.boolean(),
        status_nilai_rujukan : z.boolean(),
        no_urut : z.number().min(1),
        faskes_uuid : z.string(),
        jenis_input : z.enum(["angka", "text", "pilihan", "long text"]),
    }) 

    static UPDATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        category_pemeriksaan_uuid : z.string().uuid(),
        metode : z.string().min(1).max(255).optional(),
        satuan : z.string().min(1).max(255).optional(),
        snomed_uuid : z.string().uuid().optional(),
        icd9_uuid : z.string().uuid().optional(),
        loinc_uuid : z.string().uuid(),
        status : z.boolean(),
        status_nilai_rujukan : z.boolean(),
        no_urut : z.number().min(1),
        faskes_uuid : z.string(),
        jenis_input : z.enum(["angka", "text", "pilihan", "long text"]),
    })
}


