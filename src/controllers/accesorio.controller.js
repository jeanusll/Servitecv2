import Accesorio from "../models/accesorio.model.js";

export const createAccesorio = async (req, res) => {
  const { nombre, stock, precio, descripcion, categoria } = req.body;
  const accesorio = new Accesorio({
    nombre,
    stock,
    precio,
    descripcion,
    num_vendidos: 0,
    categoria,
  });

  try {
    if (!accesorio) {
      return res
        .status(500)
        .json({ message: "Accesorio no creado debido a un error" });
    }
    await accesorio.save();
    res.json(accesorio);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      message: "Hubo un error al guardar el accesorio: " + err.message,
    });
    return;
  }
};

export const updateAccesorio = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio, descripcion, categoria } = req.body;

  try {
    const accesorioUpdated = await Accesorio.findByIdAndUpdate(id, {
      nombre,
      stock,
      precio,
      descripcion,
      categoria,
    });

    if (!accesorioUpdated) {
      res.json({ message: "Accesorio no encontrado" });
      return;
    }

    res.json(accesorioUpdated);
  } catch (err) {
    res.json({
      error: "Hubo un error al actualizar el accesorio: " + err.message,
    });
    return;
  }
};

export const deleteAccesorio = async (req, res) => {
  const { id } = req.params;
  try {
    await Accesorio.findByIdAndDelete(id);
    res.json({ message: "Accesorio eliminado correctamente" });
  } catch (err) {
    res.json({
      error: "Hubo un error al eliminar el accesorio: " + err.message,
    });
    return;
  }
};

export const getAllAccesorio = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 50;

  try {
    const count = await Accesorio.countDocuments();

    const accesorios = await Accesorio.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.json({
      accesorios,
      currentPage: page,
      totalPages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.json({
      error: "Hubo un error al obtener los accesorios: " + err.message,
    });
  }
};

export const getAccesorio = async (req, res) => {
  const { id_accesorio } = req.params;

  try {
    const accesorio = await Accesorio.findById(id_accesorio);
    res.json(accesorio);
  } catch (err) {
    res.json({
      error: "Hubo un error al obtener el accesorio: " + err.message,
    });
    return;
  }
};
