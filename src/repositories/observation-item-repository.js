import {Op} from "sequelize";


import { ItemPemeriksaanModel, ObservationItemModel } from "@adameds/model-sdk/lab";

ObservationItemModel.belongsTo(ItemPemeriksaanModel,{
    foreignKey: "item_pemeriksaan_uuid",
    as: "item_pemeriksaan",
    constraints: false
})


export default class ObservationItemRepository {
    static async bulkCreate(data, transaction){
        return await ObservationItemModel.bulkCreate(data, {transaction});
    } 

    static async findByUuids(uuids, faskes_uuid){
        return await ObservationItemModel.findAll({
            where: {
                uuid:{
                    [Op.in]: uuids
                },
                faskes_uuid: faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            },
            include:{
                model: ItemPemeriksaanModel,
                as: "item_pemeriksaan",
                where: {
                    deleted_at: {
                        [Op.is]: null
                    }
                }
            }
        });
    }

    static async updateResult(uuid,faskes_uuid, data, transaction){
        return await ObservationItemModel.update(data, {
            where: {
                uuid: uuid,
                faskes_uuid: faskes_uuid,
            },
            transaction
        });
    }
}
