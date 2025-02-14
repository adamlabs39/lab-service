import OrderlabModel from "../../../model-sdk/models/lab/order-lab-model.js";
import {Op} from "sequelize";

export default class OrderLabRepository {
    static async create(data, transaction){
        return await OrderlabModel.create(data, {transaction});
    }

    static async findLatest(){
        return await OrderlabModel.findOne({
            where: {
                deleted_at: {
                    [Op.is]: null
                }
            }
        },{
            order: [
                ['noreg', 'DESC']
            ]
        },)
    }
}