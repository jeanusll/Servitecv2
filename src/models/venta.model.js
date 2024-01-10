import Cliente from "./cliente.model.js";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ventaSchema = new Schema({
  cantidad: Number,
  fecha: {
    type: Date,
    default: Date.now,
  },
  total: Number,
  descripcion: String,
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  accesorio: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesorio",
      required: true,
    },
  ],
  comentario: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ventaSchema.pre("findByIdAndDelete", async function (next) {
  const ventaId = this.getQuery()["_id"];
  const clienteId = this.getQuery()["cliente"];

  try {
    const venta = await this.populate("accesorio").execPopulate();

    if (venta) {
      venta.accesorio.stock += venta.cantidad;
      await venta.accesorio.save();
    }

    await Cliente.findByIdAndUpdate(clienteId, {
      $pull: {
        hist_venta: ventaId,
      },
    });

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Venta", ventaSchema);
