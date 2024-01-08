import { Router } from "express";
const router = Router();

import {
  register,
  login,
  verifyTokenUser,
} from "../controllers/usuario.controller.js";

router.post("/user/register", register);
router.post("/user/login", login);
router.get("/user/verify", verifyTokenUser);

export default router;
