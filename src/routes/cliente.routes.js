import { Router } from "express";
const router = Router();

import {
  createCliente,
  deleteCliente,
  updateCliente,
  getAllClientes,
  getCliente,
  findCliente,
} from "../controllers/cliente.controller.js";

router.get("/clientes", getAllClientes);
router.post("/cliente", createCliente);
router.post("/cliente/find", findCliente);
router.put("/cliente/:id", updateCliente);
router.delete("/cliente/:id", deleteCliente);

router.get("/cliente/:id", getCliente);

export default router;
