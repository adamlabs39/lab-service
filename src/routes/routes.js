import express from "express";
import CategoryPemeriksaanController from "../controllers/category-pemeriksaan-controller.js";

const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v1";
const baseUrl = `/${apiBase}/${apiVersion}/lab`;

const routes = express.Router();
routes.post(`${baseUrl}/category-pemeriksaan`, CategoryPemeriksaanController.create);
routes.get(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.show);
routes.get(`${baseUrl}/category-pemeriksaan`, CategoryPemeriksaanController.findAll);
routes.put(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.update);
routes.delete(`${baseUrl}/category-pemeriksaan/:uuid`, CategoryPemeriksaanController.delete);

export default routes;