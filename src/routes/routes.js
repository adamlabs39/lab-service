import express from "express";
import CategoryPemeriksaanController from "../controllers/category-pemeriksaan-controller.js";
import ItemPemeriksaanController from "../controllers/item-pemeriksaan-controller.js";
import SpesimenController from "../controllers/spesimen-controller.js";
import KelompokPemeriksaanController from "../controllers/keloompok-pemeriksaan-controller.js";
import TarifLabController from "../controllers/tarif-lab-controller.js";
import OrderLabController from "../controllers/order-lab-controller.js";
import HasilPemeriksaanController from "../controllers/hasil-pemeriksaan-controller.js";
import LaporanController from "../controllers/Laporan-controller.js";

const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v1";
const baseUrl = `/${apiBase}/${apiVersion}/lab`;

console.log("baseUrl", baseUrl);

const routes = express.Router();
routes.post(`${baseUrl}/category-pemeriksaan`, CategoryPemeriksaanController.create);
routes.get(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.show);
routes.get(`${baseUrl}/category-pemeriksaan`, CategoryPemeriksaanController.findAll);
routes.put(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.update);
routes.delete(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.delete);

routes.post(`${baseUrl}/item-pemeriksaan`, ItemPemeriksaanController.create);
routes.get(`${baseUrl}/item-pemeriksaan/:uuid`, ItemPemeriksaanController.show);
routes.get(`${baseUrl}/item-pemeriksaan`, ItemPemeriksaanController.findAll);
routes.put(`${baseUrl}/item-pemeriksaan/:uuid`, ItemPemeriksaanController.update);
routes.delete(`${baseUrl}/item-pemeriksaan/:uuid`, ItemPemeriksaanController.delete);

routes.post(`${baseUrl}/spesimen`, SpesimenController.create);
routes.get(`${baseUrl}/spesimen/:uuid`, SpesimenController.show);
routes.get(`${baseUrl}/spesimen`, SpesimenController.getAll);
routes.put(`${baseUrl}/spesimen/:uuid`, SpesimenController.update);
routes.delete(`${baseUrl}/spesimen/:uuid`, SpesimenController.delete);

routes.get(`${baseUrl}/kelompok-pemeriksaan`, KelompokPemeriksaanController.findAll);
routes.post(`${baseUrl}/kelompok-pemeriksaan`, KelompokPemeriksaanController.create);
routes.put(`${baseUrl}/kelompok-pemeriksaan/:uuid`, KelompokPemeriksaanController.update);
routes.delete(`${baseUrl}/kelompok-pemeriksaan/:uuid`, KelompokPemeriksaanController.delete);
routes.get(`${baseUrl}/kelompok-pemeriksaan/:uuid`, KelompokPemeriksaanController.show);

routes.post(`${baseUrl}/tarif-lab`, TarifLabController.create);
routes.get(`${baseUrl}/tarif-lab`, TarifLabController.getAll);
routes.put(`${baseUrl}/tarif-lab/:uuid`, TarifLabController.update);
routes.delete(`${baseUrl}/tarif-lab/:uuid`, TarifLabController.delete);
routes.get(`${baseUrl}/tarif-lab/:uuid`, TarifLabController.show);

routes.post(`${baseUrl}/nilai-rujukan/`, ItemPemeriksaanController.createNilaiRujukan);
routes.get(`${baseUrl}/nilai-rujukan/:item_pemeriksaan_uuid`, ItemPemeriksaanController.findAllNilaiRujukan);
routes.put(`${baseUrl}/nilai-rujukan/:uuid`, ItemPemeriksaanController.updateNilaiRujukan);
routes.delete(`${baseUrl}/nilai-rujukan/:uuid`, ItemPemeriksaanController.deleteNilaiRujukan);
routes.get(`${baseUrl}/nilai-rujukan/show/:uuid`, ItemPemeriksaanController.showNilaiRujukan);

routes.post(`${baseUrl}/order-lab`, OrderLabController.create);
routes.get(`${baseUrl}/order-lab/:uuid`, OrderLabController.show);
routes.get(`${baseUrl}/order-lab`, OrderLabController.findAll);
routes.put(`${baseUrl}/order-lab/:uuid`, OrderLabController.update);
routes.put(`${baseUrl}/order-lab-batal`, OrderLabController.updateBatalOrder);
routes.put(`${baseUrl}/order-lab-selesai-periksa/:uuid`, OrderLabController.selesaiPeriksa);
routes.put(`${baseUrl}/order-lab-validasi/:uuid`, OrderLabController.validasi);
routes.put(`${baseUrl}/order-lab-batal-validasi`, OrderLabController.batalValidasi);

routes.post(`${baseUrl}/hasil-pemeriksaan`, HasilPemeriksaanController.inputHasilPemeriksaan);
routes.get(`${baseUrl}/hasil-pemeriksaan/:uuid`, HasilPemeriksaanController.getHasilPemeriksaan);

routes.post(`${baseUrl}/expertise/:uuid`, HasilPemeriksaanController.expertise);

routes.get(`${baseUrl}/laporan-kunjungan`, LaporanController.getKunjungan);


export default routes;