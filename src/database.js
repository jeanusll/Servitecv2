import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Conexión exitosa a la base de datos");
    })
    .catch((error) => {
      console.error("Error al conectar a la base de datos:", error);
    });
};
