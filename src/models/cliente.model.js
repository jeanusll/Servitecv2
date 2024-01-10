import mongoose from "mongoose";
import Servicio from "./servicio.model.js";

const Schema = mongoose.Schema;

const clienteSchema = new Schema({
  nombre_apellido: {
    type: String,
    required: true,
  },
  num_telefono: String,
  distrito: String,
  direccion: String,
  referencia: String,
  hist_servicios: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
    },
  ],
  hist_venta: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venta",
    },
  ],
  hist_carga: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Carga",
    },
  ],
  comentario: String,
  dni: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

clienteSchema.pre("save", function (next) {
  if (this.nombre_apellido) {
    this.nombre_apellido = this.nombre_apellido
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }
  if (this.num_telefono) {
    this.num_telefono = this.num_telefono
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }
  if (this.distrito) {
    this.distrito = this.distrito.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.direccion) {
    this.direccion = this.direccion.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.referencia) {
    this.referencia = this.referencia.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.comentario) {
    this.comentario = this.comentario.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.dni === "") {
    this.dni = "00000000";
  } else if (this.dni) {
    this.dni = this.dni.replace(/\s+/g, " ").trim().toUpperCase();
  }
  next();
});

clienteSchema.pre("findOneAndDelete", async function (next) {
  try {
    const condition = this.getQuery();
    const cliente = await this.model.findOne(condition);

    if (cliente) {
      const deleted = await Servicio.deleteMany({ cliente: cliente._id });
      console.log(deleted);
    }
    next();
  } catch (error) {
    console.error("Error al eliminar los servicios del cliente:", error);
    throw error;
  }
});

export default mongoose.model("Cliente", clienteSchema);
