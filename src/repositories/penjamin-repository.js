import { PenjaminModel } from "@adameds/model-sdk/datamaster";
import { Op } from "sequelize";

export default class PenjaminRepository {
   static async findByUuids(uuids) {
        return await PenjaminModel.findAll({
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
}