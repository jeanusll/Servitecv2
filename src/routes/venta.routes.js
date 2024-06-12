import { Router } from "express";
const router = Router();

import {
  createVenta,
  deleteVenta,
  updateVenta,
  getAllVentas,
  getVenta,
  getVentaCliente,
} from "../controllers/venta.controller.js";

router.get("/ventas", getAllVentas);
router.post("/venta", createVenta);
router.put("/venta/:id", updateVenta);
router.delete("/venta/:id", deleteVenta);

router.get("/venta/:id_venta", getVenta);
router.get("/ventas/:id_cliente", getVentaCliente);

export default router;
