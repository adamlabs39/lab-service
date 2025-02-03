import { ItemKelompokPemeriksaanModel } from "@adameds/model-sdk/lab";
import toEpochDate from "../helpers/date-helper.js";

export default class ItemKelompokPemeriksaanRepository {
    static async update(uuid, data) {
        return await ItemKelompokPemeriksaanModel.update(data, {
            where: { uuid: uuid },
        });
    }

    static async delete(uuid) {
        return await ItemKelompokPemeriksaanModel.update(
            { deleted_at: toEpochDate(new Date()) },
            { where: { uuid: uuid } }
        );
    }

    static async deleteByKelompokPemeriksaan(kelompok_pemeriksaan_uuid) {
        return await ItemKelompokPemeriksaanModel.update(
          { deleted_at: toEpochDate(new Date()) },
          { where: { kelompok_pemeriksaan_uuid: kelompok_pemeriksaan_uuid } }
        );
      }

    static async findByCode(code, faskes_uuid) {
        return await ItemKelompokPemeriksaanModel.findOne({
            where: {
                code: code,
                deleted_at: {
                    [Op.is]: null,
                },
                faskes_uuid: faskes_uuid,
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        });
    }

    static async bulkCreate(data) {
        return await ItemKelompokPemeriksaanModel.bulkCreate(data);
    }

    static async findByUuid(uuid) {
        return await ItemKelompokPemeriksaanModel.findOne({
            where: {
                uuid: uuid,
                deleted_at: { [Op.is]: null },
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            }
        });
    }

    static async findAll(req) {
        const options = {
            where: {
                faskes_uuid: req.faskes_uuid,
                name: {
                    [Op.iLike]: `%${req.name || ""}%`,
                },
                deleted_at: {
                    [Op.is]: null,
                },
            },
            attributes: {
                exclude: ["created_at", "updated_at", "deleted_at"],
            },
        };
        return await ItemKelompokPemeriksaanModel.findAll(options);
    }
}