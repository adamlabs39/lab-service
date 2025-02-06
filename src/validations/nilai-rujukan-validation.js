import { z } from "zod"

export default class NilaiRujukanValidation{
    static CREATE_ANGKA = z.object({
        item_pemeriksaan_uuid : z.string().uuid(1),
        jenis_kelamin : z.string().min(1).max(15),
        umur_bawah_tahun : z.number(),
        umur_bawah_bulan : z.number(),
        umur_bawah_hari : z.number(),
        umur_atas_tahun : z.number(),
        umur_atas_bulan : z.number(),
        umur_atas_hari : z.number(),
        batas_bawah_nilai_normal : z.number(),
        batas_atas_nilai_normal : z.number(),
        operator_nilai_normal : z.string().min(1).max(15),
        kritis_bawah : z.number(),
        kritis_atas : z.number(),
        operator_kritis_bawah : z.string().min(1).max(15),
        operator_kritis_atas : z.string().min(1).max(15),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255),   
        tampilan : z.string().min(1).max(255),
    }).refine(
        (data)=> {
            const totalUmurBawah = data.umur_bawah_tahun * 365 + data.umur_bawah_bulan * 30 + data.umur_bawah_hari;
            const totalUmurAtas = data.umur_atas_tahun * 365 + data.umur_atas_bulan * 30 + data.umur_atas_hari;
    
           return totalUmurAtas > totalUmurBawah
        },{
            message: "Umur atas harus lebih besar dari umur bawah",
            path: ["umur_atas_tahun"]
        }
    ).refine((data)=> {
        return data.batas_atas_nilai_normal > data.batas_bawah_nilai_normal
    },{
        message: "Batas atas nilai normal harus lebih besar dari batas bawah nilai normal",
        path : ["batas_atas_nilai_normal"]
    }).refine((data)=>{
        return data.kritis_atas > data.kritis_bawah
    },{
        message: "Kritis atas harus lebih besar dari kritis bawah",
        path: ["kritis_atas"]
    })

    static PEMERIKSAAN_UUID =  z.string().min(1).max(255)
    

    static CREATE_TEXT = z.object({
        item_pemeriksaan_uuid : z.string().uuid(),
        jenis_kelamin : z.string().min(1).max(15),
        umur_bawah_tahun : z.number(),
        umur_bawah_bulan : z.number(),
        umur_bawah_hari : z.number(),
        umur_atas_tahun : z.number(),
        umur_atas_bulan : z.number(),
        umur_atas_hari : z.number(),
        nilai_normal_text : z.array(z.string().min(1).max(255)),
        tampilan : z.string().min(1).max(255),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255),
    }).refine((data)=> {
        const totalUmurBawah = data.umur_bawah_tahun * 365 + data.umur_bawah_bulan * 30 + data.umur_bawah_hari;
        const totalUmurAtas = data.umur_atas_tahun * 365 + data.umur_atas_bulan * 30 + data.umur_atas_hari;

       return totalUmurAtas > totalUmurBawah
    },{
        message: "Umur atas harus lebih besar dari umur bawah",
        path: ["umur_atas_tahun"]
    })

    static UPDATE_ANGKA = z.object({
        item_pemeriksaan_uuid : z.string().uuid(),
        jenis_kelamin : z.string().min(1).max(15),
        umur_bawah_tahun : z.number(),
        umur_bawah_bulan : z.number(),
        umur_bawah_hari : z.number(),
        umur_atas_tahun : z.number(),
        umur_atas_bulan : z.number(),
        umur_atas_hari : z.number(),
        batas_bawah_nilai_normal : z.number(),
        batas_atas_nilai_normal : z.number(),
        operator_nilai_normal : z.string().min(1).max(15),
        kritis_bawah : z.number(),
        kritis_atas : z.number(),
        operator_kritis_bawah : z.string().min(1).max(15),
        operator_kritis_atas : z.string().min(1).max(15),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255),   
        tampilan : z.string().min(1).max(255),
    }).refine(
        (data)=> {
            const totalUmurBawah = data.umur_bawah_tahun * 365 + data.umur_bawah_bulan * 30 + data.umur_bawah_hari;
            const totalUmurAtas = data.umur_atas_tahun * 365 + data.umur_atas_bulan * 30 + data.umur_atas_hari;
    
           return totalUmurAtas > totalUmurBawah
        },{
            message: "Umur atas harus lebih besar dari umur bawah",
            path: ["umur_atas_tahun"]
        }
    ).refine((data)=> {
        return data.batas_atas_nilai_normal > data.batas_bawah_nilai_normal
    },{
        message: "Batas atas nilai normal harus lebih besar dari batas bawah nilai normal",
        path : ["batas_atas_nilai_normal"]
    }).refine((data)=>{
        return data.kritis_atas > data.kritis_bawah
    },{
        message: "Kritis atas harus lebih besar dari kritis bawah",
        path: ["kritis_atas"]
    })

    static UPDATE_TEXT = z.object({
        item_pemeriksaan_uuid : z.string().uuid(),
        jenis_kelamin : z.string().min(1).max(15),
        umur_bawah_tahun : z.number(),
        umur_bawah_bulan : z.number(),
        umur_bawah_hari : z.number(),
        umur_atas_tahun : z.number(),
        umur_atas_bulan : z.number(),
        umur_atas_hari : z.number(),
        nilai_normal_text : z.array(z.string().min(1).max(255)),
        tampilan : z.string().min(1).max(255),
        status : z.boolean(),
        faskes_uuid : z.string().min(1).max(255),
    }).refine((data)=> {
        const totalUmurBawah = data.umur_bawah_tahun * 365 + data.umur_bawah_bulan * 30 + data.umur_bawah_hari;
        const totalUmurAtas = data.umur_atas_tahun * 365 + data.umur_atas_bulan * 30 + data.umur_atas_hari;

       return totalUmurAtas > totalUmurBawah
    },{
        message: "Umur atas harus lebih besar dari umur bawah",
        path: ["umur_atas_tahun"]
    })
}