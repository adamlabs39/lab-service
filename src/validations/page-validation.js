import { z } from "zod";

export default class PageValidation{
    static PAGINATION = z.object({
        page : z.number().optional(),
        limit : z.number().optional(),
    })
}