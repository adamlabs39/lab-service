import { SpesimenModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";
import pagination from "../helpers/pagination.js";
import {Op} from "sequelize";

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

    static async findByCode(code, faskes_uuid) {
        return await SpesimenModel.findOne({
            where: {
                code: code,
                deleted_at: {
                    [Op.is]: null
                },
                faskes_uuid: faskes_uuid
            }
        });
    }

    static async findByUuid(uuid) {
        return await SpesimenModel.findOne({
            where: { uuid: uuid, deleted_at: {[Op.is]:null} },
            attributes:{
                exclude: ["created_at", "updated_at", "deleted_at"]
            }
        });
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

    static async findByUuids(uuids) {
        return await SpesimenModel.findAll({
            where: {
                uuid: {
                    [Op.in]: uuids
                }
            }
        });
    }
}