import Venta from "../models/venta.model.js";
import Cliente from "../models/cliente.model.js";

export const createVenta = async (req, res) => {
  const {
    cantidad,
    fecha,
    total,
    descripcion,
    cliente,
    accesorio,
    comentario,
  } = req.body;

  const venta = new Venta({
    cantidad,
    fecha,
    total,
    descripcion,
    cliente,
    accesorio,
    comentario,
  });

  try {
    await venta.save();
    res.json({ message: "Venta creada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar la venta: " + err.message });
    return;
  }
};

export const updateVenta = async (req, res) => {
  const {
    id_venta,
    cantidad,
    fecha,
    total,
    descripcion,
    cliente,
    accesorio,
    comentario,
  } = req.body;

  try {
    await Venta.findByIdAndUpdate(id_venta, {
      cantidad,
      fecha,
      total,
      descripcion,
      cliente,
      accesorio,
      comentario,
    });
    res.json({ message: "Venta actualizada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al actualizar la venta: " + err.message });
    return;
  }
};

export const deleteVenta = async (req, res) => {
  const { id_venta } = req.body;

  try {
    await Venta.findByIdAndDelete(id_venta);
    res.json({ message: "Venta eliminada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al eliminar la venta: " + err.message });
  }
};

export const getAllVentas = async (req, res) => {
  const ventas = await Venta.find();
  res.json(ventas);
};

export const getVenta = async (req, res) => {
  const { id_venta } = req.params;
  const venta = await Venta.findById(id_venta);
  res.json(venta);
};

export const getVentaCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const cliente = await Cliente.findById(id_cliente)
      .populate("hist_venta")
      .execPopulate();

    res.json(cliente.hist_venta);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener las ventas: " + err.message });
    return;
  }
};
