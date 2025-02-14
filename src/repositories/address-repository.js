import { AddressModel } from "@adameds/model-sdk/setting";

export default class AddressRepository{
    static async create(data, transaction){
        return await AddressModel.create(data, {transaction});
    }
}