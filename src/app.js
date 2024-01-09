import { fileURLToPath } from "url";
import path, { dirname } from "path";
import morgan from "morgan";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import accesorioRoutes from "./routes/accesorio.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import pendienteRoutes from "./routes/pendiente.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import cargaRoutes from "./routes/carga.routes.js";
import servicioRoutes from "./routes/servicio.routes.js";
import ventaRoutes from "./routes/venta.routes.js";
import hoja_trabajoRoutes from "./routes/hoja_trabajo.routes.js";
import programarRoutes from "./routes/programar.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "https://servitecv2-production.up.railway.app",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api", ventaRoutes);
app.use("/api", clienteRoutes);
app.use("/api", accesorioRoutes);
app.use("/api", pendienteRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", cargaRoutes);
app.use("/api", servicioRoutes);
app.use("/api", hoja_trabajoRoutes);
app.use("/api", programarRoutes);

const frontendBuildPath = path.join(__dirname, "public", "dist");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

export { app };
