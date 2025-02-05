export default class TarifLabValidation {
    static CREATE = z.object({
        code: z.string().min(1).max(255),
        name: z.string().min(1).max(255),
        
    });

    static UPDATE = z.object({
        code: z.string().min(1).max(255),
        name: z.string().min(1).max(255),
        kelompok_pemeriksaan_uuid: z.string().uuid(),
        status: z.boolean(),
        faskes_uuid: z.string().min(1).max(255),
    });
}