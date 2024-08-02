import mongoose from "mongoose";
import Counter from "./counter.model.js";

const Schema = mongoose.Schema;

const ventaSchema = new Schema({
  fecha: {
    type: Date,
    default: Date.now,
  },
  serial: { type: String, unique: true },
  total: Number,
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
  },
  accesorios: [
    {
      cantidad: Number,
      accesorio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Accesorio",
        required: true,
      },
      total: Number,
    },
  ],
});

ventaSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "ventaId" },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.serial = counter.sequence_value.toString().padStart(6, "0");
    } catch (err) {
      console.error("Error al generar el serial:", err);
      throw err;
    }
  }
  next();
});

const Venta = mongoose.model("Venta", ventaSchema);

export default Venta;
