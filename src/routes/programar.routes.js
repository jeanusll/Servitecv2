import { Router } from "express";

const router = Router();

import { programar } from "../controllers/programar.controller.js";

router.post("/programar", programar);

export default router;
