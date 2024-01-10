import Cliente from "./cliente.model.js";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const servicioSchema = new Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  numero_llamada: { type: String, default: "Particular" },
  tienda: String,
  marca: String,
  producto: {
    type: String,
  },
  serie: {
    type: String,
    default: "Sin serie",
  },
  fecha_visita: {
    type: Date,
    required: true,
  },
  tipo_servicio: String,
  estado_realizado: { type: Boolean, default: true },
  turno: String,
  color: String,
  comentario: {
    type: String,
    default: "",
  },
  encargado: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

servicioSchema.pre("save", function (next) {
  if (this.tienda) {
    this.tienda = this.tienda.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.marca) {
    this.marca = this.marca.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.producto) {
    this.producto = this.producto.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.serie) {
    this.serie = this.serie.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.tipo_servicio) {
    this.tipo_servicio = this.tipo_servicio
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }
  if (this.turno) {
    this.turno = this.turno.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.color) {
    this.color = this.color.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.comentario) {
    this.comentario = this.comentario.replace(/\s+/g, " ").trim().toUpperCase();
  }
  if (this.encargado) {
    this.encargado = this.encargado.replace(/\s+/g, " ").trim().toUpperCase();
  }

  next();
});

servicioSchema.post("save", async function (doc) {
  try {
    const cliente = await Cliente.findById(doc.cliente);

    if (cliente) {
      cliente.hist_servicios.push(doc._id);
      await cliente.save();
    }
  } catch (error) {
    console.error(
      "Error al actualizar el historial de servicios del cliente:",
      error
    );
    throw error;
  }
});

servicioSchema.post("findOneAndDelete", async function (doc) {
  try {
    const cliente = await Cliente.findById(doc.cliente);

    if (cliente) {
      cliente.hist_servicios.pull(doc._id);
      await cliente.save();
    }
  } catch (error) {
    console.error(
      "Error al eliminar el servicio del historial del cliente:",
      error
    );
    throw error;
  }
});

export default mongoose.model("Servicio", servicioSchema);
