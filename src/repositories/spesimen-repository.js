import { SpesimenModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";
import pagination from "../helpers/pagination.js";

export default class SpesimenRepository {
    static async create(data) {
        return await SpesimenModel.create({
            name : data.name,
            code : data.code,
            faskes_uuid : data.faskes_uuid,
            status : data.status
        });
    }

    static async update(uuid, data) {
        return await SpesimenModel.update(data, {
            where: { uuid: uuid }
        });
    }

    static async delete(uuid) {
        return await SpesimenModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { uuid: uuid } }
        );
    }

    static async findByCode(code) {
        return await SpesimenModel.findOne({
            where: {
                code: code,
                deleted_at: null
            }
        });
    }

    static async findByUuid(uuid) {
        return await SpesimenModel.findByPk(uuid);
    }

    static async findAll(req) {
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

        return pagination(SpesimenModel, req, options);
    }
}