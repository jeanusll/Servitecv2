import Usuario from "../models/usuario.model.js";
import jwt from "jsonwebtoken";

export const verifyToken = async (token) => {
  try {
    const user = await jwt.verify(token, process.env.TOKEN_SECRET);
    const userFound = await Usuario.findById(user.id);
    if (!userFound) return null;

    return {
      id: userFound._id,
    };
  } catch (error) {
    return null;
  }
};
