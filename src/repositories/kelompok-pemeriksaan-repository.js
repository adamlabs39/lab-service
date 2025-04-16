import {CategoryPemeriksaanModel, ItemKelompokPemeriksaanModel, ItemPemeriksaanModel, KelompokPemeriksaanModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";
import pagination from "../helpers/pagination.js";

KelompokPemeriksaanModel.belongsTo(CategoryPemeriksaanModel, {
    foreignKey: "category_pemeriksaan_uuid",
    as: "category_pemeriksaan",
    constraints: false,
})

export default class KelompokPemeriksaanRepository {
    static async create(data, transaction) {
        return await KelompokPemeriksaanModel.create(data, { transaction });
    }

    static async update(uuid, data, transaction) {
        return await KelompokPemeriksaanModel.update(data, {
            where: { uuid: uuid },
        }, { transaction });
    }

    static async findByCodeIn(code, faskes_uuid) {
        console.log("code", code);
        return await KelompokPemeriksaanModel.findAll({
            where: {
                code: {
                    [Op.in]: code,
                },
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
    }

    static async findByUuids(uuids) {
        return await KelompokPemeriksaanModel.findAll({
            where: {
                uuid: {
                    [Op.in]: uuids,
                },
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
    }

    static async delete(uuid, transaction) {
        return await KelompokPemeriksaanModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { uuid: uuid } },
            { transaction }
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
                    },
                    
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

        return await pagination(KelompokPemeriksaanModel, req, options);
    }

    static async bulkCreate(data, transaction) {
        return await KelompokPemeriksaanModel.bulkCreate(data, { transaction },{returning : true});
    }

    static async findByNameIn(name, faskes_uuid) {
        return await KelompokPemeriksaanModel.findAll({
            where: {
                name: {
                    [Op.in]: name,
                },
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
    }
}