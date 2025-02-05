import {  ItemPemeriksaanModel, KelompokPemeriksaanModel, TarifLabItemModel, TarifLabModel, TarifLabPelayananModel, TarifLabPenjaminModel } from "@adameds/model-sdk/lab";
import { Op } from "sequelize";
import toEpochDate from "../helpers/date-helper.js";
import { PenjaminModel } from "@adameds/model-sdk/datamaster";

TarifLabModel.hasMany(TarifLabPenjaminModel, {
    foreignKey: "tarif_lab_uuid",
    as: "tarif_lab_penjamin",
    constraints: false,
})

TarifLabModel.hasMany(TarifLabPelayananModel, {
    foreignKey: "tarif_lab_uuid",
    as: "pelayanan",
    constraints: false,
})

TarifLabModel.hasMany(TarifLabItemModel, {
    foreignKey: "tarif_lab_uuid",
    as: "tarif_lab_item",
    constraints: false,
})

export default class TarifLabRepository{
    static async create(data){
        return await TarifLabModel.create(data);
    }

    static async findByCode(code, faskes_uuid){
        return await TarifLabModel.findOne({
            where: {
                code: code,
                deleted_at: null,
                faskes_uuid: faskes_uuid
            }
        });
    }

    static async findByUuid(uuid){
        return await TarifLabModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: {
                    [Op.is]: null
                }
            }
        });
    }

    static async update(uuid, data){
        return await TarifLabModel.update(data, {
            where: {
                uuid: uuid
            }
        });
    }

    static async delete(uuid){
        return await TarifLabModel.update({
            deleted_at: toEpochDate(new Date())
        }, {
            where: {
                uuid: uuid
            }
        });
    }

    static async findAll(req){
        // return await TarifLabModel.findAll({
        //     include:{
        //         model: TarifLabItemModel,
        //         as: "tarif_lab_item",
        //         where: {
        //             deleted_at: {
        //                 [Op.is]: null
        //             }
        //         },
        //     }
        // })

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
            include: [
                {
                    model: TarifLabPenjaminModel,
                    as: "tarif_lab_penjamin",
                    where: {
                        deleted_at: {
                            [Op.is]: null
                        }
                    },
                    
                    include: {
                        model:PenjaminModel,
                        as: "penjamin",
                        where: {
                            deleted_at: {
                                [Op.is]: null
                            }
                        },
                        attributes: ["uuid", "name"]
                    }
                },
                {
                    model: TarifLabPelayananModel,
                    as: "pelayanan",
                    where: {
                        deleted_at: {
                            [Op.is]: null
                        }
                    },
                    attributes: ["uuid", "pelayanan"]
                },
                {
                    model: TarifLabItemModel,
                    as: "tarif_lab_item",
                    include : [
                        {
                            model: KelompokPemeriksaanModel,
                            as: "kelompok_pemeriksaan",
                            // where: {
                            //     deleted_at: {
                            //         [Op.is]: null
                            //     }
                            // },
                            attributes: ["uuid", "name"]
                        },
                        {
                            model:ItemPemeriksaanModel,
                            as: "item_pemeriksaan",
                            // where: {
                            //     deleted_at: {
                            //         [Op.is]: null
                            //     }
                            // },
                            attributes: ["uuid", "name"]
                        }
                    ]
                }
            ],
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"]
            }
        };

        return await TarifLabModel.findAll(options);
    }
}