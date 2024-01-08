import { Router } from "express";
const router = Router();

import {
  createPendiente,
  deletePendiente,
  updatePendiente,
  getAllPendientes,
  getPendiente,
} from "../controllers/pendiente.controller.js";

router.get("/pendientes", getAllPendientes);
router.post("/pendiente", createPendiente);
router.put("/pendiente", updatePendiente);
router.delete("/pendiente", deletePendiente);

router.get("/pendiente/:id_pendiente", getPendiente);

export default router;
