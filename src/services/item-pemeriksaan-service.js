import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import ItemPemeriksaanValidation from "../validations/item-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import LoincRepository from "../repositories/loinc-repository.js";
import SnomedRepository from "../repositories/snomed-repository.js";
import Icd9Repository from "../repositories/icd9-repository.js";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import PilihanHasilItemPemeriksaanRepository from "../repositories/pilihan-hasil-item-pemeriksaan-repository.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import NilaiRujukanValidation from "../validations/nilai-rujukan-validation.js";
import NilaiRujukanRepository from "../repositories/nilai-rujukan-repository.js";
import BadRequestException from "../exception/bad-request-exception.js";
import sequelizeInstance from "@adameds/model-sdk/instance";


export default class ItemPemeriksaanService {
    static async create(req) {
        const validData = ZodValidator.validate(ItemPemeriksaanValidation.CREATE, req);
 
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByCode(validData.code, validData.faskes_uuid);
  
        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(validData.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan tidak ada");
        }

        if (isItemPemeriksaanExist) {
            throw new ConflictException("Item Pemeriksaan dengan code tersebut telah digunakan");
        }
        
        const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);
        
        if (!isIoincExist) {
            console.log("404")
            throw new NotfoundException("Loinc tidak ada");
        }

        if(req.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed tidak ada");
            }
        }

        if(req.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 tidak ada");
            }
        }

        
        sequelizeInstance.transaction(async (t) => {
            const itemPemeriksaan = await ItemPemeriksaanRepository.create(validData, t);
            if(validData.jenis_input === "pilihan"){
                await PilihanHasilItemPemeriksaanRepository.create({
                    item_pemeriksaan_uuid: itemPemeriksaan.uuid,
                    pilihan_hasil: validData.pilihan_hasil_item_pemeriksaans,
                    "faskes_uuid": validData.faskes_uuid
                }, t)
            }
        })
    
    }

    static async update(uuid, req) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(req.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan tidak ada");
        }

        const validData = ZodValidator.validate(ItemPemeriksaanValidation.UPDATE, req);

        const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);

        if (!isIoincExist) {
            throw new NotfoundException("Loinc tidak ada");
        }

        if(req.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed tidak ada");
            }
        }

        if(req.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 tidak ada");
            }
        }

        
        sequelizeInstance.transaction(async (t) => {
            await ItemPemeriksaanRepository.update(uuid, validData, t);
            if(validData.jenis_input === "pilihan"){
                await PilihanHasilItemPemeriksaanRepository.deleteByItemPemeriksaan(uuid, t);
                await PilihanHasilItemPemeriksaanRepository.create({
                    item_pemeriksaan_uuid: uuid,
                    pilihan_hasil: validData.pilihan_hasil_item_pemeriksaans,
                    "faskes_uuid": validData.faskes_uuid
                }, t)
            }
        })

    }

    static async delete(uuid) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        sequelizeInstance.transaction(async (t) => {
            if(isItemPemeriksaanExist.jenis_input === "pilihan"){
                await PilihanHasilItemPemeriksaanRepository.deleteByItemPemeriksaan(uuid, t);
            }
    
            await ItemPemeriksaanRepository.delete(uuid, t);
        })
    }

    static async show(uuid) {
        const itemPemeriksaan = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!itemPemeriksaan) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        return itemPemeriksaan;
    }

    static async findAll(req) {
        const itemPemeriksaan = await ItemPemeriksaanRepository.findAll(req);
        return itemPemeriksaan;
    }

    static async createNilaiRujukan(req){
        console.log("req", req.item_pemeriksaan_uuid );
        const validItemPemeriksaanUuid = ZodValidator.validate(NilaiRujukanValidation.PEMERIKSAAN_UUID, req.item_pemeriksaan_uuid);
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(validItemPemeriksaanUuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        let validata
        if(isItemPemeriksaanExist.jenis_input == "angka"){
            validata = ZodValidator.validate(NilaiRujukanValidation.CREATE_ANGKA, req);
        }else if(isItemPemeriksaanExist.jenis_input === "text" || item_pemeriksaan_uuid.jenis_input === "long text"){
            validata = ZodValidator.validate(NilaiRujukanValidation.CREATE_TEXT, req);
        }else{
            throw new BadRequestException("Jenis input tidak valid");
        }

        sequelizeInstance.transaction(async (t) => {
            await NilaiRujukanRepository.create(validata, t);
        })
    }

    static async findAllNilaiRujukan(item_pemeriksaan_uuid){
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(item_pemeriksaan_uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        return await NilaiRujukanRepository.findByItemPemeriksaan(item_pemeriksaan_uuid);
        
    }

    static async updateNilaiRujukan(uuid, req){
        const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

        if (!isNilairujukanExist) {
            throw new NotfoundException("Nilai Rujukan tidak ada");
        }

        const validPemeriksaanUuid = ZodValidator.validate(NilaiRujukanValidation.PEMERIKSAAN_UUID, req.item_pemeriksaan_uuid);

        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(validPemeriksaanUuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan tidak ada");
        }

        let validata

        if(isItemPemeriksaanExist.jenis_input == "angka"){
            validata = ZodValidator.validate(NilaiRujukanValidation.UPDATE_ANGKA, req);
        }else if(isItemPemeriksaanExist.jenis_input === "text" || item_pemeriksaan_uuid.jenis_input === "long text"){
            validata = ZodValidator.validate(NilaiRujukanValidation.UPDATE_TEXT, req);
        }else{
            throw new BadRequestException("Jenis input tidak valid");
        }

        sequelizeInstance.transaction(async (t) => {
            await NilaiRujukanRepository.update(uuid, validata, t);
        })
    }

    static async deleteNilaiRujukan(uuid){
        const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

        if (!isNilairujukanExist) {
            throw new NotfoundException("Nilai Rujukan tidak ada");
        }

        sequelizeInstance.transaction(async (t) => {
            await NilaiRujukanRepository.delete(uuid, t);
        })
    }

    static async showNilaiRujukan(uuid){
        const isNilairujukanExist = await NilaiRujukanRepository.findByUuid(uuid);

        if (!isNilairujukanExist) {
            throw new NotfoundException("Nilai Rujukan tidak ada");
        }

        return isNilairujukanExist;
    }
}