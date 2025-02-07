import { z } from "zod";

export default class  CategoryPemeriksaanValidation {
    static CREATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        no_urut : z.number().min(1),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })

    static IMPORT = z.array(this.CREATE)

    static UPDATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        no_urut : z.number().min(1),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })
}