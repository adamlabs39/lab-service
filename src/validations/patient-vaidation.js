import { z } from "zod";

export default class PatientValidation {
    static CREATE = z.object ({
        title: z.string().min(1).max(255).optional(),
        satu_sehat_uuid: z.string().uuid().optional(),
        name: z.string().min(1).max(255),
        no_rm: z.string().min(1).max(255),
        identity: z.string().min(1).max(255),
        no_identity: z.string().min(1).max(255),
        birth_date: z.coerce.date(),
        birth_place: z.string().min(1).max(255),
        age_year: z.number().min(1),
        age_month: z.number().min(1),
        age_day: z.number().min(1),
        gender: z.string().min(1).max(255),
        phone : z.string().min(1).max(255),
        religion: z.string().min(1).max(255),
        language: z.string().min(1).max(255),
        mother_name: z.string().min(1).max(255),
        marital_status: z.string().min(1).max(255),
        is_new_born: z.boolean().optional(),
        full_address: z.string().min(1).max(255),
        prov: z.string().min(1).max(255),
        city: z.string().min(1).max(255),
        district: z.string().min(1).max(255),
        rt : z.number().min(1),
        rw : z.number().min(1),
        village : z.string().min(1).max(255),
        postal_code : z.string().min(1).max(255),
        country: z.string().min(1).max(255),
    })
}