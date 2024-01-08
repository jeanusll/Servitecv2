import { Router } from "express";

const router = Router();
import {
  createCarga,
  updateCarga,
  deleteCarga,
  setEncargado,
  getAllCargas,
  getCarga,
  getCargasCliente,
} from "../controllers/carga.controller.js";

router.get("/cargas", getAllCargas);
router.post("/carga", createCarga);
router.put("/carga", updateCarga);
router.delete("/carga", deleteCarga);

router.patch("/carga/setEncargado", setEncargado);

router.get("cargas/:id_cliente", getCargasCliente);
router.get("/carga/:id_carga", getCarga);

export default router;
