import {CategoryPemeriksaanModel, ItemKelompokPemeriksaanModel, ItemPemeriksaanModel, KelompokPemeriksaanModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";

KelompokPemeriksaanModel.belongsTo(CategoryPemeriksaanModel, {
    foreignKey: "category_pemeriksaan_uuid",
    as: "category_pemeriksaan",
    constraints: false,
})

export default class KelompokPemeriksaanRepository {
    static async create(data) {
        return await KelompokPemeriksaanModel.create(data);
    }

    static async update(uuid, data) {
        return await KelompokPemeriksaanModel.update(data, {
            where: { uuid: uuid },
        });
    }

    static async delete(uuid) {
        return await KelompokPemeriksaanModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { uuid: uuid } }
        );
    }

    static async findByCode(code, faskes_uuid) {
        return await KelompokPemeriksaanModel.findOne({
            where: {
                code: code,
                deleted_at: {
                    [Op.is]: null,
                },
                faskes_uuid: faskes_uuid,
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        });
    }

    static async findByUuid(uuid) {
        return await KelompokPemeriksaanModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null },
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            }
        });
    }

    static async findAll(req) {
        const options = {
            where: {
                faskes_uuid: req.faskes_uuid,
                name: {
                    [Op.iLike]: `%${req.name || ""}%`,
                },
                deleted_at: {
                    [Op.is]: null,
                },
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
            include:[
                {
                    model: ItemKelompokPemeriksaanModel,
                    as: "item_kelompok_pemeriksaan",
                    where: {
                        deleted_at: {
                            [Op.is]: null,
                        },
                    },
                    include :{
                        model : ItemPemeriksaanModel,
                        as : "item_pemeriksaan",
                        where : {
                            deleted_at : {
                                [Op.is] : null
                            }
                        },
                        attributes : ["uuid", "name", "code"]
                    }
                },
                 {
                    model : CategoryPemeriksaanModel,
                    as : "category_pemeriksaan",
                    where : {
                        deleted_at : {
                            [Op.is] : null
                        }
                    },
                    attributes : ["uuid", "name", "code"]
                }
            ],
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        };

        return await KelompokPemeriksaanModel.findAll(options);
    }
}