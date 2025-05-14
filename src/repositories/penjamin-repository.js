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

   static async findByNameIn(name, faskes_uuid) {
        return await PenjaminModel.findAll({
            where: {
                name: {
                    [Op.in]: name
                },
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
   }

   static async findByCodeIn(code, faskes_uuid) {
        // console.log("code", code);
        return await PenjaminModel.findAll({
            where: {
                code: {
                    [Op.in]: code
                },
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null,
                },
            },
        });
   }
}