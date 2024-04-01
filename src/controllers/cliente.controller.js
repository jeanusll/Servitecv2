import Cliente from "../models/cliente.model.js";

export const createCliente = async (req, res) => {
  const {
    nombre_apellido,
    num_telefono,
    distrito,
    direccion,
    referencia,
    comentario,
    dni,
  } = req.body;

  const cliente = new Cliente({
    nombre_apellido,
    num_telefono,
    distrito,
    direccion,
    referencia,
    hist_servicios: [],
    hist_venta: [],
    hist_carga: [],
    comentario,
    dni,
  });

  try {
    await cliente.save();
    res.json({
      cliente,
      currentPage: req.query.page || 1,
    });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar el cliente: " + err.message });
    return;
  }
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_apellido,
    num_telefono,
    distrito,
    direccion,
    referencia,
    comentario,
    dni,
  } = req.body;

  try {
    await Cliente.findByIdAndUpdate(id, {
      nombre_apellido,
      num_telefono,
      distrito,
      direccion,
      referencia,
      comentario,
      dni,
    });
    res.json({ ...req.body });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar el cliente: " + err.message });
  }
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const clienteEliminado = await Cliente.findOneAndDelete({ _id: id });

    if (!clienteEliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.status(200).json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    return res.status(500).json({ error: "Error al eliminar el cliente" });
  }
};

export const getCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await Cliente.findById(id);
    res.json(cliente);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener el cliente: " + err.message });
    return;
  }
};

export const getAllClientes = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 50;

  try {
    const clientes = await Cliente.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("hist_servicios");

    const totalClientes = await Cliente.countDocuments();

    res.json({
      clientes,
      currentPage: page,
      totalPages: Math.ceil(totalClientes / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al obtener los clientes" });
  }
};

export const findCliente = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 50;

  try {
    let { data } = req.body;
    data = data.replace(/\s+/g, " ").trim().toUpperCase();
    const skipAmount = (page - 1) * perPage;

    const clientesEncontrados = await Cliente.find({
      $or: [
        { nombre_apellido: { $regex: data, $options: "i" } },
        { num_telefono: { $regex: data, $options: "i" } },
        { dni: { $regex: data, $options: "i" } },
        { direccion: { $regex: data, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(perPage)
      .populate("hist_servicios");

    const totalClientes = await Cliente.countDocuments({
      $or: [
        { nombre_apellido: { $regex: data, $options: "i" } },
        { num_telefono: { $regex: data, $options: "i" } },
        { dni: { $regex: data, $options: "i" } },
      ],
    });

    res.json({
      clientes: clientesEncontrados,
      currentPage: page,
      totalPages: Math.ceil(totalClientes / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al obtener los clientes" });
  }
};
