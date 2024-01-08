import { Router } from "express";
const router = Router();

import {
  createServicio,
  deleteServicio,
  updateServicio,
  checkServicio,
  getAllServicios,
  findServicio,
  reprogramarServicio,
} from "../controllers/servicio.controller.js";

router.get("/servicios", getAllServicios);
router.post("/servicio", createServicio);
router.put("/servicio", updateServicio);
router.delete("/servicio/:id_servicio", deleteServicio);

router.patch("/servicio/check/:id", checkServicio);

router.post("/servicio/find", findServicio);
router.post("/servicio/reprogramar", reprogramarServicio);
export default router;
