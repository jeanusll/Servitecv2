import Venta from "../models/venta.model.js";
import Accesorio from "../models/accesorio.model.js";
import Cliente from "../models/cliente.model.js";
import PDFDocument from "pdfkit";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const makeVenta = (accesorios) => {
  const total = accesorios.reduce(
    (sum, accesorio) => sum + accesorio.precio * accesorio.cantidad,
    0
  );

  const cantidadAccesorio = accesorios.map((item) => ({
    cantidad: item.cantidad,
    accesorio: item._id,
  }));

  return { total, cantidadAccesorio };
};

export const createBoletaPDF = async (ventaId) => {
  try {
    const venta = await Venta.findById(ventaId)
      .populate("cliente")
      .populate("accesorios.accesorio")
      .exec();

    if (!venta) {
      throw new Error("Venta no encontrada");
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [80 * 2.83465, 500],
        margins: { top: 10, bottom: 10, left: 10, right: 10 },
      });
      const filePath = path.join(__dirname, `boleta_${venta.serial}.pdf`);

      const stream = fs.createWriteStream(filePath);

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));

      doc.pipe(stream);

      doc
        .fontSize(12)
        .text("SERVITEC LUCIO REPRESENTACIONES S.R.L.", { align: "center" });
      doc
        .fontSize(10)
        .text("CENTRO AUTORIZADO DE SERVICIO", { align: "center" });
      doc.text("DIRECCION: CALLE AMPATACOCHA 104", { align: "center" });
      doc.text("YANAHUARA", { align: "center" });
      doc.text("RUC: 20605733418", { align: "center" });
      doc.text("CEL: 959679508", { align: "center" });
      doc.text("CEL: 981151179", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`TICKET N°${venta.serial}`, { align: "center" });
      doc
        .fontSize(10)
        .text(`CLIENTE: ${venta.cliente.nombre_apellido}`, { align: "center" });
      doc.text(`DNI: ${venta.cliente.dni ? venta.cliente.dni : "00000000"}`, {
        align: "center",
      });
      doc.text(`FECHA: ${venta.fecha.toLocaleDateString()}`, {
        align: "center",
      });
      doc.text(`HORA: ${venta.fecha.toLocaleTimeString()}`, {
        align: "center",
      });
      doc.moveDown();

      let tableTop = doc.y;
      const itemWidth = 45;
      const descriptionWidth = 90;
      const unitPriceWidth = 35;
      const totalWidth = 45;

      doc
        .fontSize(8)
        .text("CANT", 0, tableTop, { width: itemWidth, align: "center" })
        .text("DESCRIPCION", itemWidth, tableTop, {
          width: descriptionWidth,
          align: "center",
        })
        .text("P/U", itemWidth + descriptionWidth, tableTop, {
          width: unitPriceWidth,
          align: "center",
        })
        .text(
          "IMPORTE",
          itemWidth + descriptionWidth + unitPriceWidth,
          tableTop,
          { width: totalWidth, align: "center" }
        );

      let rowTop = tableTop + 10;
      venta.accesorios.forEach((item) => {
        const importe = item.cantidad * item.accesorio.precio;

        const descriptionHeight = doc.heightOfString(item.accesorio.nombre, {
          width: descriptionWidth,
        });

        if (
          rowTop + descriptionHeight + 5 >
          doc.page.height - doc.page.margins.bottom
        ) {
          doc.addPage();
          rowTop = doc.page.margins.top;
        }

        doc
          .fontSize(8)
          .text(item.cantidad, 0, rowTop, {
            width: itemWidth,
            align: "center",
          })
          .text(item.accesorio.nombre, itemWidth, rowTop, {
            width: descriptionWidth,
            align: "left",
          })
          .text(
            `S/ ${item.accesorio.precio.toFixed(2)}`,
            itemWidth + descriptionWidth,
            rowTop,
            {
              width: unitPriceWidth,
              align: "center",
            }
          )
          .text(
            `S/ ${importe.toFixed(2)}`,
            itemWidth + descriptionWidth + unitPriceWidth,
            rowTop,
            {
              width: totalWidth,
              align: "center",
            }
          );

        rowTop += descriptionHeight + 5;
      });
      doc.moveDown();
      doc.text(`TOTAL `, itemWidth + descriptionWidth, rowTop, {
        width: totalWidth,
        align: "center",
      });
      doc.text(
        `S/${venta.total.toFixed(2)}`,
        itemWidth + descriptionWidth + unitPriceWidth,
        rowTop,
        {
          width: totalWidth,
          align: "center",
        }
      );
      doc.moveDown();

      doc.text("", 10);

      doc
        .fontSize(8)
        .text("ESTE DOCUMENTO NO ES VALIDO COMO COMPROBANTE DE PAGO", {
          align: "center",
        });
      doc.fontSize(8).text("CANJEAR POR BOLETA O FACTURA PREVIA PRESENTACION", {
        align: "center",
      });

      doc.end();
    });
  } catch (error) {
    console.error("Error al crear el PDF:", error);
    throw error;
  }
};

export const printVenta = async (req, res) => {
  const id = req.params.id;

  try {
    const filePath = await createBoletaPDF(id);

    res.download(filePath, `boleta.pdf`, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al descargar la boleta");
      } else {
        console.log("Archivo enviado correctamente");
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error al eliminar el archivo:", unlinkErr);
          } else {
            console.log("Archivo eliminado correctamente");
          }
        });
      }
    });
  } catch (err) {
    console.error("Hubo un error al guardar la venta:", err);
    res.json({ error: "Hubo un error al guardar la venta: " + err.message });
  }
};

export const createVenta = async (req, res) => {
  const { formData } = req.body;
  const { accesorios, cliente } = formData;
  const { total, cantidadAccesorio } = makeVenta(accesorios);

  try {
    let id_cliente = cliente._id;

    if (id_cliente == "") {
      const { _id, ...clienteSinId } = cliente;
      const newCliente = new Cliente(clienteSinId);
      await newCliente.save();
      id_cliente = newCliente._id;
    }

    const venta = new Venta({
      total,
      cliente: id_cliente,
      accesorios: cantidadAccesorio,
    });

    await venta.save();

    for (const item of cantidadAccesorio) {
      const updatedAccesorio = await Accesorio.findByIdAndUpdate(
        item.accesorio,
        {
          $inc: {
            stock: -item.cantidad,
            num_vendidos: item.cantidad,
          },
        },
        { new: true }
      );
    }

    const filePath = await createBoletaPDF(venta._id);

    res.download(filePath, `boleta_${venta.serial}.pdf`, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al descargar la boleta");
      } else {
        console.log("Archivo enviado correctamente");
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error al eliminar el archivo:", unlinkErr);
          } else {
            console.log("Archivo eliminado correctamente");
          }
        });
      }
    });
  } catch (err) {
    console.error("Hubo un error al guardar la venta:", err);
    res.json({ error: "Hubo un error al guardar la venta: " + err.message });
  }
};

export const deleteVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const venta = await Venta.findById(id).populate("accesorios.accesorio");

    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    for (const item of venta.accesorios) {
      const accesorio = item.accesorio;
      accesorio.stock += item.cantidad;
      accesorio.num_vendidos -= item.cantidad;
      await accesorio.save();
    }

    await Venta.findByIdAndDelete(id);

    res.json({ message: "Venta eliminada correctamente y stock restaurado" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Hubo un error al eliminar la venta: " + err.message });
  }
};

export const getAllVentas = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 10;

  try {
    const ventas = await Venta.find()
      .sort({ serial: -1 })
      .populate("cliente")
      .populate("accesorios.accesorio")
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalVentas = await Venta.countDocuments();

    res.json({
      ventas: ventas,
      currentPage: page,
      totalPages: Math.ceil(totalVentas / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al obtener las Ventas" });
  }
};

export const getVenta = async (req, res) => {
  const { id_venta } = req.params;
  const venta = await Venta.findById(id_venta);
  res.json(venta);
};

export const getVentaCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const cliente = await Cliente.findById(id_cliente)
      .populate("hist_venta")
      .execPopulate();

    res.json(cliente.hist_venta);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener las ventas: " + err.message });
    return;
  }
};

export const searchVenta = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const perPage = 10;

  try {
    let { data } = req.body;
    const query = data || "";
    const regex = new RegExp(query.replace(/\s+/g, " ").trim(), "i");
    const skipAmount = (page - 1) * perPage;

    let ventas = await Venta.find({
      $or: [
        { serial: { $regex: regex } },
        {
          cliente: {
            $in: await Cliente.find({
              nombre_apellido: { $regex: regex },
            }).distinct("_id"),
          },
        },
      ],
    })
      .populate("cliente")
      .sort({ fecha: -1 })
      .skip(skipAmount)
      .limit(perPage)
      .exec();

    const totalVentas = await Venta.countDocuments({
      $or: [
        { serial: { $regex: regex } },
        {
          cliente: {
            $in: await Cliente.find({
              nombre_apellido: { $regex: regex },
            }).distinct("_id"),
          },
        },
      ],
    });

    if (ventas.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.json({
      ventas: ventas,
      currentPage: page,
      totalPages: Math.ceil(totalVentas / perPage),
    });
  } catch (error) {
    console.error("Error al buscar la venta:", error);
    res.status(500).json({ message: "Hubo un error al buscar la venta" });
  }
};
