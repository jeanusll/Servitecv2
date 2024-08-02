import { Router } from "express";

const router = Router();
import {
  createAccesorio,
  updateAccesorio,
  deleteAccesorio,
  getAllAccesorio,
  getAccesorio,
  searchAccesorio,
} from "../controllers/accesorio.controller.js";

//import { auth } from "../middlewares/auth.middleware";

router.get("/accesorios", getAllAccesorio);
router.post("/accesorio", createAccesorio);
router.put("/accesorio/:id", updateAccesorio);
router.delete("/accesorio/:id", deleteAccesorio);

router.post("/accesorio/find", searchAccesorio);

router.get("/accesorio/:id_accesorio", getAccesorio);

export default router;
