import Cliente from "./cliente.model.js";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const cargaSchema = new Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  direccion: String,
  id_compra: { required: true, type: String },
  producto: String,
  fecha_recepcion: Date,
  fecha_entrega: Date,
  fecha_envio: Date,
  precio: Number,
  estado_producto: String,
  estado_entrega: String,
  comentario: String,
  encargado: { type: String, default: "No se encargó un técnico" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

cargaSchema.pre("findByIdAndDelete", async function (next) {
  const cargaId = this.getQuery()["_id"];
  const clienteId = this.getQuery()["cliente"];

  try {
    await Cliente.findByIdAndUpdate(clienteId, {
      $pull: {
        hist_carga: cargaId,
      },
    });
    next();
  } catch (err) {
    next(err);
  }
});
export default mongoose.model("Carga", cargaSchema);
