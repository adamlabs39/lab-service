import ConflictException from "../exception/conflict-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import CategoryPemeriksaanRepository from "../repositories/category-pemeriksaan-repository.js";
import Icd9Repository from "../repositories/icd9-repository.js";
import ItemKelompokPemeriksaanRepository from "../repositories/item-kelompok-pemeriksaan-repository.js";
import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import KelompokPemeriksaanRepository from "../repositories/kelompok-pemeriksaan-repository.js";
import LoincRepository from "../repositories/loinc-repository.js";
import SnomedRepository from "../repositories/snomed-repository.js";
import KelompokPemeriksaanValidation from "../validations/kelompok-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";

export default class KelompokPemeriksaanService {
    static async create(req) {
        const validData = ZodValidator.validate(KelompokPemeriksaanValidation.CREATE, req);

        validData.item_pemeriksaans.forEach(async (item) => {
           const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(item);

              if (!isItemPemeriksaanExist) {
                throw new NotfoundException("Item Pemeriksaan not found");
                }
        });

        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(validData.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan not found");
        }

        if(validData.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(validData.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed not found");
            }
        }

        if(validData.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(validData.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 not found");
            }
        }

        const isLoincExist = await LoincRepository.findByUuid(validData.loinc_uuid);

        if (!isLoincExist) {
            throw new NotfoundException("Loinc not found");
        }

        const isCodeExist = await KelompokPemeriksaanRepository.findByCode(validData.code, validData.faskes_uuid);

        if (isCodeExist) {
            throw new ConflictException("Kelompok Pemeriksaan already exist");
        }

        const kelompokPemeriksaan = await KelompokPemeriksaanRepository.create(validData);


       const itemKelompokPemeriksaans = validData.item_pemeriksaans.map(item =>{
        return {
            kelompok_pemeriksaan_uuid: kelompokPemeriksaan.uuid,
            item_pemeriksaan_uuid: item
        }
       })

         await ItemKelompokPemeriksaanRepository.bulkCreate(itemKelompokPemeriksaans);
        
    }

    static async update(uuid, data) {
        const isKelompokPemeriksaanExist = await KelompokPemeriksaanRepository.findByUuid(uuid);

        if (!isKelompokPemeriksaanExist) {
            throw new NotfoundException("Kelompok Pemeriksaan not found");
        }

        const validData = ZodValidator.validate(KelompokPemeriksaanValidation.UPDATE, data);

        validData.item_pemeriksaans.forEach(async (item) => {
            const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(item);

            if (!isItemPemeriksaanExist) {
                throw new NotfoundException("Item Pemeriksaan not found");
            }
        });

        const isCategoryPemeriksaanExist = await CategoryPemeriksaanRepository.findByUuid(validData.category_pemeriksaan_uuid);

        if (!isCategoryPemeriksaanExist) {
            throw new NotfoundException("Category Pemeriksaan not found");
        }


        if(validData.snomed_uuid){
            const isSnomedExist = await SnomedRepository.find(validData.snomed_uuid);
            if (!isSnomedExist) {
                throw new NotfoundException("Snomed not found");
            }
        }

        if(validData.icd9_uuid){
            const isIcd9Exist = await Icd9Repository.find(validData.icd9_uuid);
            if (!isIcd9Exist) {
                throw new NotfoundException("Icd9 not found");
            }
        }

        const isLoincExist = await LoincRepository.findByUuid(validData.loinc_uuid);

        if (!isLoincExist) {
            throw new NotfoundException("Loinc not found");
        }

        await ItemKelompokPemeriksaanRepository.deleteByKelompokPemeriksaan(uuid);

        const itemKelompokPemeriksaans = validData.item_pemeriksaans.map(item =>{
            return {
                kelompok_pemeriksaan_uuid: uuid,
                item_pemeriksaan_uuid: item
            }
        })

        await ItemKelompokPemeriksaanRepository.bulkCreate(itemKelompokPemeriksaans);
        

        return await KelompokPemeriksaanRepository.update(uuid, validData);
    }

    static async delete(uuid) {
        const isKelompokPemeriksaanExist = await KelompokPemeriksaanRepository.findByUuid(uuid);

        if (!isKelompokPemeriksaanExist) {
            throw new NotfoundException("Kelompok Pemeriksaan not found");
        }

        await ItemKelompokPemeriksaanRepository.deleteByKelompokPemeriksaan(uuid);

        return await KelompokPemeriksaanRepository.delete(uuid);
    }

    static async getAll(req) {
        const kelompokPemerikasan = await KelompokPemeriksaanRepository.findAll(req);
        // return kelompokPemerikasan      

        const formatedKelompokPemeriksaan = kelompokPemerikasan.map(kelompokPemeriksaan => {
            return {
                id: kelompokPemeriksaan.id,
                name: kelompokPemeriksaan.name,
                code: kelompokPemeriksaan.code,
                uuid: kelompokPemeriksaan.uuid,
                category_pemeriksaan_uuid: kelompokPemeriksaan.category_pemeriksaan_uuid,
                category_pemeriksaan: kelompokPemeriksaan.category_pemeriksaan,
                item_pemeriksaan: kelompokPemeriksaan.item_kelompok_pemeriksaan.map(item => {
                    return {
                        id : item.item_pemeriksaan.id,
                        name: item.item_pemeriksaan.name,
                        uuid: item.item_pemeriksaan.uuid,
                    }
                }  
                )
            };
        });
        

        return formatedKelompokPemeriksaan;
    }
}

