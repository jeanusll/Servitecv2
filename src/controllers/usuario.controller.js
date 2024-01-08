import Usuario from "../models/usuario.model.js";
import { createAccessToken } from "../libs/jwt.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../libs/verifyToken.js";

export const register = async (req, res) => {
  const { nombre, username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new Usuario({
    nombre,
    username,
    password: passwordHash,
  });

  try {
    await user.save();

    const token = await createAccessToken({
      id: user._id,
      username: user.username,
    });

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Usuario creado correctamente" });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      res.status(400).json({ message: "El nombre de usuario ya existe" });
      return;
    }
    return res
      .status(500)
      .json({ message: "Hubo un error al guardar el usuario: " + err.message });
  }
};

export const verifyTokenUser = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(500).json({ message: "No token provided" });

  try {
    const userFound = await verifyToken(token);

    if (!userFound)
      return res.status(500).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al verificar el token" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await Usuario.findOne({ username });

  if (!user) return res.status(400).json({ message: "El usuario no existe" });

  const passwordMatch = await user.comparePassword(password, user.password);

  if (!passwordMatch)
    return res.status(400).json({ message: "Contraseña incorrecta" });

  const token = await createAccessToken({
    id: user._id,
    username: user.username,
  });

  res.cookie("token", token, {
    httpOnly: process.env.NODE_ENV !== "development",
    secure: true,
    sameSite: "none",
  });

  return res.json({ name: user.nombre, _id: user._id });
};
