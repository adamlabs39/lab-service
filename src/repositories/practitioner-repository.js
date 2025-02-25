import { PractitionerModel } from "@adameds/model-sdk/datamaster";
import {Op} from "sequelize";

export default class PractitionerRepository{
    static async findbyUuid(uuid, faskes_uuid){
        return await PractitionerModel.findOne({
            where: {
                uuid,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                }
            }
        })
    }

    static async findByUuidDokter(uuid, faskes_uuid){
        return await PractitionerModel.findOne({
            where: {
                uuid,
                faskes_uuid,
                deleted_at: {
                    [Op.is]: null
                },
                is_doctor: true
            }
        })
    }
}