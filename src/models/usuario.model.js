import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const saltRounds = 10;

const usuarioSchema = mongoose.Schema({
  nombre: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

usuarioSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
};

usuarioSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

export default mongoose.model("Usuario", usuarioSchema);
