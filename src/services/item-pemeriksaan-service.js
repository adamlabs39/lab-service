import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import ItemPemeriksaanValidation from "../validations/item-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";
import LoincRepository from "../repositories/loinc-repository.js";
import SnomedRepository from "../repositories/snomed-repository.js";
import Icd9Repository from "../repositories/icd9-repository.js";
import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";


export default class ItemPemeriksaanService {
    static async create(req) {
        const validData = ZodValidator.validate(ItemPemeriksaanValidation.CREATE, req);
 
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByCode(validData.code, validData.faskes_uuid);
  
        
        if (isItemPemeriksaanExist) {
            throw new ConflictException("Item Pemeriksaan already exist");
        }
        
        const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);
        
        if (!isIoincExist) {
            console.log("404")
            throw new NotfoundException("Loinc not found");
        }

        if(req.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed not found");
            }
        }

        if(req.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 not found");
            }
        }

        const itemPemeriksaan = await ItemPemeriksaanRepository.create(validData);
        return itemPemeriksaan;
    }

    static async update(uuid, req) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan not found");
        }

        const validData = ZodValidator.validate(ItemPemeriksaanValidation.UPDATE, req);

        const isIoincExist = await LoincRepository.findByUuid(req.loinc_uuid);

        if (!isIoincExist) {
            throw new NotfoundException("Loinc not found");
        }

        if(req.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(req.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed not found");
            }
        }

        if(req.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(req.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 not found");
            }
        }

        const itemPemeriksaan = await ItemPemeriksaanRepository.update(uuid, validData);

        return itemPemeriksaan;
    }

    static async delete(uuid) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        console.log("uuid", uuid);
        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan not found");
        }

        console.log("uuid", uuid);

        const itemPemeriksaan = await ItemPemeriksaanRepository.delete(uuid);
        return itemPemeriksaan;
    }

    static async show(uuid) {
        const itemPemeriksaan = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!itemPemeriksaan) {
            throw new NotfoundException("Item Pemeriksaan not found");
        }

        return itemPemeriksaan;
    }

    static async findAll(req) {
        const itemPemeriksaan = await ItemPemeriksaanRepository.findAll(req);
        return itemPemeriksaan;
    }
}