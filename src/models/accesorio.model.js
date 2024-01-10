import mongoose from "mongoose";
const Schema = mongoose.Schema;

const accesorioSchema = new Schema({
  nombre: { type: String, required: true },
  stock: { type: Number, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String },
  num_vendidos: { type: Number },
  categoria: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Accesorio", accesorioSchema);
