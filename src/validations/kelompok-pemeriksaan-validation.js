import { z } from "zod"

export default class KelompokPemeriksaanValidation{
    static CREATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        snomed_uuid : z.string().uuid().optional(),
        icd9_uuid : z.string().uuid().optional(),
        loinc_uuid : z.string().uuid(),
        category_pemeriksaan_uuid : z.string().uuid(),
        item_pemeriksaans : z.array(z.string().uuid()),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })

    static UPDATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        snomed_uuid : z.string().uuid().optional(),
        icd9_uuid : z.string().uuid().optional(),
        loinc_uuid : z.string().uuid(),
        category_pemeriksaan_uuid : z.string().uuid(),
        item_pemeriksaans : z.array(z.string().uuid()),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })
}