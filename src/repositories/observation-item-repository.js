import {Op, fn, col} from "sequelize";

import { ItemPemeriksaanModel, ObservationItemModel, OrderLabModel } from "@adameds/model-sdk/lab";
import { status } from "../services/order-lab-service.js";
import pagination from "../helpers/pagination.js";

ObservationItemModel.belongsTo(ItemPemeriksaanModel,{
    foreignKey: "item_pemeriksaan_uuid",
    as: "item_pemeriksaan",
    constraints: false
})

ObservationItemModel.belongsTo(OrderLabModel,{
    foreignKey: "order_lab_uuid",
    as: "order_lab",
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

    static async findByOrderLabUuid(order_lab_uuid, faskes_uuid){
        return await ObservationItemModel.findAll({
            where: {
                order_lab_uuid: order_lab_uuid,
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
                },
                attributes: {
                    exclude: ["created_at", "updated_at", "deleted_at"]
                }
            }
        });
    }

    static async findByOrderLabUuidAndStatusSudahPeriksa(order_lab_uuid, faskes_uuid){
        return await ObservationItemModel.findAll({
            where: {
                order_lab_uuid: order_lab_uuid,
                faskes_uuid: faskes_uuid,
                status_periksa: true,
                deleted_at: {
                    [Op.is]: null
                }
            },
        })
          
    }

    static async findRekapPemeriksaan(req){
        const whereOrderStatus = {};

        if (req.order_status) {
          whereOrderStatus.order_status = req.order_status;
        }
    
        const whereDate = {};
    
        if (req.start_date || req.end_date) {
          whereDate.tgl_order = {};
    
          if (req.start_date) {
            whereDate.tgl_order[Op.gte] = req.start_date;
          }
    
          if (req.end_date) {
            whereDate.tgl_order[Op.lte] = req.end_date;
          }
        }
    
        const whereSearch = {};
    
        if(req.search){
          whereSearch[Op.or] = [
            {
              no_rm: {
                [Op.iLike]: `%${req.search}%`,
              },
            //   '$patient.name$': {
            //     [Op.iLike]: `%${req.search}%`,
            //   },
            //   '$patient.address.full_address$': {
            //     [Op.iLike]: `%${req.search}%`,
            //   }
            },
          ];
        }
    
        const wherePelayanan = {}
    
        if(req.pelayanan){
          wherePelayanan.pelayanan = req.pelayanan
        }
        
        

        const options = {
            where: {
                faskes_uuid: req.faskes_uuid,
                deleted_at: { [Op.is]: null }
            },
            include: [
                {
                    model: ItemPemeriksaanModel,
                    as: "item_pemeriksaan",
                    where: { deleted_at: { [Op.is]: null } },
                    attributes: ["name"]
                },
                {
                    model: OrderLabModel,
                    as: "order_lab",
                    where: {
                        order_status: status.SELESAI,
                        deleted_at: { [Op.is]: null }
                    },
                    attributes: ["created_at"],
                },
            ],
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"]
            }
        }

        return await pagination(ObservationItemModel, req, options);
    }    
}
