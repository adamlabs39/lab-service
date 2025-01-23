import { z } from "zod";

export default class SpesimenValidation {
    static CREATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })

    static UPDATE = z.object({
        code : z.string().min(1).max(255),
        name : z.string().min(1).max(255),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255)
    })
}