import Pendiente from "../models/pendiente.model.js";

export const createPendiente = async (req, res) => {
  const { servicio, estado, razon } = req.body;

  const pendiente = new Pendiente({
    servicio,
    estado,
    razon,
  });
  try {
    pendiente.save();
    res.json({ message: "Pendiente creado correctamente" });
  } catch (err) {
    res.json({
      error: "Hubo un error al guardar el pendiente: " + err.message,
    });
    return;
  }
};

export const updatePendiente = async (req, res) => {
  const { id_pendiente, servicio, estado, razon } = req.body;

  try {
    await Pendiente.findByIdAndUpdate(id_pendiente, {
      servicio,
      estado,
      razon,
    });
    res.json({ message: "Pendiente actualizado correctamente" });
  } catch (err) {
    res.json({
      error: "Hubo un error al guardar el pendiente: " + err.message,
    });
    return;
  }
};

export const deletePendiente = async (req, res) => {
  const { id_pendiente } = req.body;

  try {
    await Pendiente.findByIdAndDelete(id_pendiente);
    res.json({ message: "Pendiente eliminado correctamente" });
  } catch (err) {
    res.json({
      error: "Hubo un error al eliminar el pendiente: " + err.message,
    });
    return;
  }
};

export const getAllPendientes = async (req, res) => {
  try {
    const pendientes = await Pendiente.find();
    res.json(pendientes);
  } catch (err) {
    res.json({
      error: "Hubo un error al obtener los pendientes: " + err.message,
    });
    return;
  }
};

export const getPendiente = async (req, res) => {
  const { id_pendiente } = req.params;

  try {
    const pendiente = await Pendiente.findById(id_pendiente);
    res.json(pendiente);
  } catch (err) {
    res.json({
      error: "Hubo un error al obtener el pendiente: " + err.message,
    });
    return;
  }
};
