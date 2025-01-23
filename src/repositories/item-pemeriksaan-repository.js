import { ItemPemeriksaanModel } from "@adameds/model-sdk/lab";
import pagination from "../helpers/pagination.js";
import toEpochDate from "../helpers/date-helper.js";

export default class ItemPemeriksaanRepository {
    static async create(data){
        return await ItemPemeriksaanModel.create(req);
    }

    static async update(uuid, data){
        return await ItemPemeriksaanModel.update(data, {
            where: { uuid: uuid }
        });
    }

    static async delete(uuid){
        return await ItemPemeriksaanModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { uuid: uuid } }
        );
    }

    static async findByCode(code){
        return await ItemPemeriksaanModel.findOne({
            where: {
                code: code,
                deleted_at: null
            }
        });
    }

    static async findByUuid(uuid){
        return await ItemPemeriksaanModel.findByPk(uuid);
    }

    static async findAll(req){
        const options = {
            where: {
                faskes_uuid: req.faskes_uuid,
                name: {
                    [Op.iLike]: `%${req.name || ""}%`
                },
                deleted_at: {
                    [Op.is]: null
                }
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"]
            }
        };

        return pagination(ItemPemeriksaanModel, req, options);
    }
}