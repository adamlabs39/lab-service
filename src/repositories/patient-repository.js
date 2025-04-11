import { BirthDetailModel, PatientModel } from "@adameds/model-sdk/admisi";
import { Op } from "sequelize";

export default class PatientRepository {
    static async findByUuid(uuid, faskes_uuid){
        return await PatientModel.findOne({
            where: {
                uuid,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            },
            include:{
                model: BirthDetailModel,
                as : 'birth_detail',
                where:{
                    deleted_at: {
                        [Op.is]: null
                    }
                }
            }
        })
    }

    static async create(data, transaction){
        return await PatientModel.create(data, {transaction});
    }

    static async findByNoRm(noRm, faskes_uuid){
        return await PatientModel.findOne({
            where: {
                noRm: noRm,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            }
        });
    }
}