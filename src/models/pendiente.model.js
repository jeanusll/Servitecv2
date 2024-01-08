import mongoose from "mongoose";
const Schema = mongoose.Schema;

const pendienteSchema = new Schema({
  servicio: {
    type: Schema.Types.ObjectId,
    ref: "Servicio",
  },
  estado: Boolean,
  razon: String,
  fecha: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("Pendiente", pendienteSchema);
