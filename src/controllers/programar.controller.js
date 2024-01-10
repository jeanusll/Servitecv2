import Servicio from "../models/servicio.model.js";
import Cliente from "../models/cliente.model.js";

export const programar = async (req, res) => {
  const { cliente, servicios } = req.body;

  let client;

  if (cliente._id !== "" && cliente._id != undefined) {
    client = await Cliente.findById(cliente._id);

    if (!client) {
      return res.status(500).json({ message: "Cliente no encontrado" });
    }
  } else {
    const { _id, ...clienteSinID } = cliente;
    const clienteNuevo = new Cliente(clienteSinID);
    await clienteNuevo.save();
    client = clienteNuevo;
  }

  await Promise.all(
    servicios.map(async (servicio) => {
      const newServicio = new Servicio({
        ...servicio,
        cliente: client._id,
      });
      await newServicio.save();
    })
  );

  return res.status(200).json({ message: "Programación guardada" });
};
