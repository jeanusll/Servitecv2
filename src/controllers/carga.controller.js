import Carga from "../models/carga.model.js";
import Cliente from "../models/cliente.model.js";

export const createCarga = async (req, res) => {
  const {
    cliente,
    direccion,
    id_compra,
    producto,
    fecha_recepcion,
    fecha_entrega,
    fecha_envio,
    precio,
    estado_producto,
    estado_entrega,
    comentario,
  } = req.body;

  const carga = new Carga({
    cliente,
    direccion,
    id_compra,
    producto,
    fecha_recepcion,
    fecha_entrega,
    fecha_envio,
    precio,
    estado_producto,
    estado_entrega,
    comentario,
  });

  try {
    await carga.save();
    res.json({ message: "Carga creada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar la carga: " + err.message });
    return;
  }
};

export const updateCarga = async (req, res) => {
  const {
    id_carga,
    direccion,
    id_compra,
    producto,
    fecha_recepcion,
    fecha_entrega,
    fecha_envio,
    precio,
    estado_producto,
    estado_entrega,
    comentario,
  } = req.body;

  try {
    await Carga.findByIdAndUpdate(id_carga, {
      direccion,
      id_compra,
      producto,
      fecha_recepcion,
      fecha_entrega,
      fecha_envio,
      precio,
      estado_producto,
      estado_entrega,
      comentario,
    });
  } catch (err) {
    res.json({ error: "Hubo un error al actualizar la carga: " + err.message });
    return;
  }
};

export const deleteCarga = async (req, res) => {
  const { id_carga } = req.body;

  try {
    await Carga.findByIdAndDelete(id_carga);
    res.json({ message: "Carga eliminada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al eliminar la carga: " + err.message });
    return;
  }
};

export const setEncargado = async (req, res) => {
  const { id_carga, encargado } = req.body;
  try {
    await Carga.findByIdAndUpdate(id_carga, { encargado });
  } catch (err) {
    res.json({
      error: "Hubo un error al asignar el encargado: " + err.message,
    });
    return;
  }
};

export const getAllCargas = async (req, res) => {
  try {
    const cargas = await Carga.find();
    res.json(cargas);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener las cargas: " + err.message });
    return;
  }
};

export const getCarga = async (req, res) => {
  const { id_carga } = req.params;
  try {
    const carga = await Carga.findById(id_carga);
    res.json(carga);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener la carga: " + err.message });
    return;
  }
};

export const getCargasCliente = async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const cliente = await Cliente.findById(id_cliente)
      .populate("hist_carga")
      .execPopulate();

    res.json(cliente.hist_carga);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener las cargas: " + err.message });
    return;
  }
};
