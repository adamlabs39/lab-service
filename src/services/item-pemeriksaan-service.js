import ItemPemeriksaanRepository from "../repositories/item-pemeriksaan-repository.js";
import ItemPemeriksaanValidation from "../validations/item-pemeriksaan-validation.js";
import ZodValidator from "../validations/zod-validator.js";


export default class ItemPemeriksaanService {
    static async create(req) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByCode(req.code);

        if (isItemPemeriksaanExist) {
            throw new ConflictException("Item Pemeriksaan already exist");
        }

        const validData = ZodValidator.validate(ItemPemeriksaanValidation.CREATE, req);
        const itemPemeriksaan = await ItemPemeriksaanRepository.create(validData);
        return itemPemeriksaan;
    }

    static async update(uuid, data) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan not found");
        }

        const validData = ZodValidator.validate(ItemPemeriksaanValidation.UPDATE, data);
        const itemPemeriksaan = await ItemPemeriksaanRepository.update(uuid, validData);

        console.log(itemPemeriksaan);
        return itemPemeriksaan;
    }

    static async delete(uuid) {
        const isItemPemeriksaanExist = await ItemPemeriksaanRepository.findByUuid(uuid);

        if (!isItemPemeriksaanExist) {
            throw new NotfoundException("Item Pemeriksaan not found");
        }

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