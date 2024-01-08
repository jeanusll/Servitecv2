import Servicio from "../models/servicio.model.js";
import Cliente from "../models/cliente.model.js";

export const reprogramarServicio = async (req, res) => {
  const { id, date } = req.body;

  const servicioUpdated = await Servicio.findByIdAndUpdate(id, {
    fecha_visita: new Date(date),
  });

  if (!servicioUpdated) {
    return res
      .status(500)
      .json({ message: "No se ha encontrado el servicio." });
  }

  return res.status(200).json({ message: "Actualizado correctamente." });
};

export const createServicio = async (req, res) => {
  const {
    cliente,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
  } = req.body;

  const servicio = new Servicio({
    cliente,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
  });

  try {
    await servicio.save();
    res.json(servicio);
  } catch (err) {
    res.json({ error: "Hubo un error al guardar el servicio: " + err.message });
    return;
  }
};

export const updateServicio = async (req, res) => {
  const {
    _id,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
  } = req.body;

  try {
    await Servicio.findByIdAndUpdate(_id, {
      numero_llamada,
      tienda,
      marca,
      producto,
      serie,
      fecha_visita,
      tipo_servicio,
      estado_realizado,
      turno,
      color,
      comentario,
    });
    res.json({ ...req.body });
  } catch (err) {
    res.json({
      error: "Hubo un error al actualizar el servicio: " + err.message,
    });
    return;
  }
};

export const deleteServicio = async (req, res) => {
  const { id_servicio } = req.params;

  try {
    const servicioEliminado = await Servicio.findOneAndDelete({
      _id: id_servicio,
    });

    if (!servicioEliminado) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el servicio:", error);
    return res.status(500).json({ error: "Error al eliminar el servicio" });
  }
};

export const checkServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ message: "El servicio no fue encontrado" });
    }

    const checkServicio = await Servicio.findByIdAndUpdate(id, {
      estado_realizado: !servicio.estado_realizado,
    });

    if (!checkServicio) {
      return res
        .status(500)
        .json({ message: "Hubo un error al checkear el servicio" });
    }

    res.json({ message: "Servicio checkeado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Hubo un error al checkear el servicio: " + err.message,
    });
  }
};

export const getServiciosCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const cliente = await Cliente.findById(id_cliente)
      .populate("hist_servicios")
      .exec();

    res.json(cliente.hist_servicios);
  } catch (err) {
    res.json({
      error: "Hubo un error al obtener los servicios: " + err.message,
    });
    return;
  }
};

export const getServicio = async (req, res) => {
  const { id_servicio } = req.params;
  try {
    const servicio = await Servicio.findById(id_servicio);
    res.json(servicio);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener el servicio: " + err.message });
    return;
  }
};

export const getAllServicios = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 50;

  try {
    const count = await Servicio.countDocuments();
    const servicios = await Servicio.find()
      .populate({ path: "cliente", select: "nombre_apellido" })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({
      servicios,
      currentPage: page,
      totalPages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(500).json({
      error: "Hubo un error al obtener los servicios: " + err.message,
    });
  }
};

export const findServicio = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 50;
  const data = String(req.body.data || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  const skipAmount = (page - 1) * perPage;

  const serviciosEncontrados = await Servicio.find({
    $or: [
      { numero_llamada: { $regex: data, $options: "i" } },
      {
        cliente: {
          $in: (
            await Cliente.find({
              nombre_apellido: { $regex: data, $options: "i" },
            })
          ).map((c) => c._id),
        },
      },
    ],
  })
    .skip(skipAmount)
    .limit(perPage)
    .populate("cliente");

  const totalServicios = await Servicio.countDocuments({
    $or: [
      { numero_llamada: { $regex: data, $options: "i" } },
      {
        cliente: {
          $in: (
            await Cliente.find({
              nombre_apellido: { $regex: data, $options: "i" },
            })
          ).map((c) => c._id),
        },
      },
    ],
  }).populate("cliente");

  res.json({
    servicios: serviciosEncontrados,
    currentPage: page,
    totalPages: Math.ceil(totalServicios / perPage),
  });
};
