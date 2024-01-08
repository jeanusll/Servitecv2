import { app } from "./app.js";
import { connectDB } from "./database.js";
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main();
