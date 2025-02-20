import { BirthDetailModel } from "@adameds/model-sdk/admisi";

export default class BirthDetailRepository{
    static async create(data, transaction){
        return await BirthDetailModel.create(data, {transaction});
    }
}