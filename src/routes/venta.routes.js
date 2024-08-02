import { Router } from "express";
const router = Router();

import {
  createVenta,
  deleteVenta,
  getAllVentas,
  getVenta,
  getVentaCliente,
  searchVenta,
  printVenta,
} from "../controllers/venta.controller.js";

router.get("/ventas", getAllVentas);
router.post("/venta", createVenta);
router.delete("/venta/:id", deleteVenta);
router.post("/venta/find", searchVenta);
router.post("/venta/print/:id", printVenta);

router.get("/venta/:id_venta", getVenta);
router.get("/ventas/:id_cliente", getVentaCliente);

export default router;
