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

   static async findByUuid(uuid, faskes_uuid) {
         return await PenjaminModel.findOne({
                where: {
                  uuid,
                  faskes_uuid,
                  deleted_at: {
                   [Op.is]: null,
                  },
                },
         });
   }
}