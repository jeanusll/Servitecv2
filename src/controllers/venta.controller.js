import Venta from "../models/venta.model.js";
import Cliente from "../models/cliente.model.js";

const makeVenta = (accesorios) => {
  const total = accesorios.reduce(
    (sum, accesorio) => sum + accesorio.precio * accesorio.cantidad,
    0
  );

  const cantidadAccesorio = accesorios.map((item) => ({
    cantidad: item.cantidad,
    accesorio: item._id,
  }));

  return { total, cantidadAccesorio };
};

export const createVenta = async (req, res) => {
  const { formData } = req.body;

  const { accesorios, cliente } = formData;

  const { total, cantidadAccesorio } = makeVenta(accesorios);
  try {
    let id_cliente = cliente._id;

    if (id_cliente) {
    }

    const venta = new Venta({
      total,
      cliente: id_cliente,
      nombre_cliente: cliente.nombre_apellido,
      accesorios: cantidadAccesorio,
    });

    await venta.save();
    res.json({ message: "Venta creada correctamente" });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar la venta: " + err.message });
    return;
  }
};

export const updateVenta = async (req, res) => {
  const { id_venta, accesorios } = req.body;

  try {
    await Venta.findByIdAndUpdate(id_venta, {
      total,
      accesorios,
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
  const page = req.query.page || 1;
  const perPage = 50;

  try {
    const ventas = await Venta.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalVentas = await Venta.countDocuments();

    res.json({
      ventas: ventas,
      currentPage: page,
      totalPages: Math.ceil(totalVentas / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al obtener las Ventas" });
  }
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
