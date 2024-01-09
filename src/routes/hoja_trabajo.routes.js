import { Router } from "express";

const router = Router();

import {
  getHojaTrabajo,
  downloadExcel,
} from "../controllers/hoja_trabajo.controller.js";

router.get("/hoja_trabajo/:date", getHojaTrabajo);

router.get("/hoja_trabajo/download/:date", downloadExcel);

export default router;
