import Servicio from "../models/servicio.model.js";
import htmlDocx from "html-docx-js";

const distritos = [
  "YURA",
  "CERRO COLORADO",
  "CAYMA",
  "YANAHUARA",
  "SACHACA",
  "UCHUMAYO",
  "AREQUIPA",
  "ALTO SELVA ALEGRE",
  "MIRAFLORES",
  "MARIANO MELGAR",
  "PAUCARPATA",
  "JOSE LUIS BUSTAMANTE Y RIVERO",
  "JACOBO HUNTER",
  "SOCABAYA",
  "CHARACATO",
  "MOLLENDO",
  "MEJIA",
  "PUNTA DE BOMBON",
  "MATARANI",
];

const ordenarServiciosPorDistrito = (servicios) => {
  return servicios.sort((a, b) => {
    const distritoAIndex = distritos.indexOf(a.cliente.distrito);
    const distritoBIndex = distritos.indexOf(b.cliente.distrito);

    if (distritoAIndex === -1) return 1;
    if (distritoBIndex === -1) return -1;

    return distritoAIndex - distritoBIndex;
  });
};

export const getHojaTrabajo = async (req, res) => {
  const { date } = req.params;
  try {
    const day = new Date(date);

    const servicios = await Servicio.find({ fecha_visita: day }).populate({
      path: "cliente",
      select: "nombre_apellido num_telefono distrito direccion referencia",
    });

    const sortedServicios = ordenarServiciosPorDistrito(servicios);
    const total = groupServicesByClient(sortedServicios).length;

    if (!servicios) {
      return res
        .status(500)
        .json({ message: "No hay Servicios para esta fecha" });
    }

    return res.json({ servicios: sortedServicios, total });
  } catch (err) {
    console.log(err.name);
    console.log("error");
  }
};

const colorDescriptions = {
  PINK: "REPUESTO",
  GRAY: "COBRAR",
  BLUE: "TRANSPORTE",
  YELLOW: "URGENTE",
  ORANGE: "POSTERGADO",
  RED: "RECLAMO",
  PURPLE: "VENTA",
};

export const downloadWord = async (req, res) => {
  const { date } = req.params;

  try {
    const day = new Date(date);

    const servicios = await Servicio.find({ fecha_visita: day }).populate({
      path: "cliente",
      select: "nombre_apellido num_telefono distrito direccion referencia",
    });

    if (servicios.length === 0)
      return res.status(500).json({ message: "No hay servicios para mostrar" });

    const sortedServicios = ordenarServiciosPorDistrito(servicios);

    const serviciosPorCliente = groupServicesByClient(sortedServicios);

    let htmlContent = `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>          
          table {
            width: 100%;
            border-collapse: collapse;            
          }
          th, td {
            border: 1px solid black;
            font-weight: bold;
            font-size: 8pt;
          }
          .green-text {
            color: green;
          }
          .red-text {
            color: red;
          }
          .purple-text {
            color: purple;
          }
          .yellow-background {
            background-color: yellow;
          }
          .comment-text {
            background-color: yellow;
            color: red;
          }
          .yellow-cell {
            background-color: yellow;
          }
        </style>
      </head>
      <body>
        <table>
          <tbody>`;

    serviciosPorCliente.forEach((servicio, index) => {
      const { cliente, servicios } = servicio;
      const { productos, comentarios, numeroLlamada } =
        makeDescription(servicios);
      const turno = servicios[0].turno.toUpperCase();
      const descripcion = `${cliente.nombre_apellido.toUpperCase()} <span class="red-text">${cliente.num_telefono.toUpperCase()}</span> <span class="purple-text">${cliente.distrito.toUpperCase()}</span> ${cliente.direccion.toUpperCase()} Ref/ ${cliente.referencia.toUpperCase()} - ${productos.toUpperCase()} <span class="comment-text">${comentarios.toUpperCase()}</span>`;
      const turnoClass =
        turno === "T/M" || turno === "T/T" ? "yellow-cell" : "";
      const lastRow =
        index === serviciosPorCliente.length - 1
          ? "border-bottom: 1px solid black;"
          : "";
      htmlContent += `<tr style="${lastRow}">
        <td class="green-text">${numeroLlamada.toUpperCase()}</td>
        <td>${descripcion}</td>
        <td class="${turnoClass}">${turno}</td>
        <td style=" background-color:${servicios[0].color}">${
        colorDescriptions[servicios[0].color]
          ? colorDescriptions[servicios[0].color]
          : ""
      }</td>
        <td>${servicios[0].encargado.toUpperCase()}</td>
      </tr>`;
    });

    htmlContent += `</tbody></table></body></html>`;

    const converted = htmlDocx.asBlob(htmlContent);
    const keys = Object.keys(converted);
    console.log(converted);
    console.log(keys);

    res.writeHead(200, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=hoja_trabajo.docx",
      "Content-Length": converted.length,
    });
    res.end(converted);
  } catch (error) {
    console.error("Error al generar el archivo Word:", error);
    res.status(500).json({ error: "Error al generar el archivo Word" });
  }
};

const groupServicesByClient = (servicios) => {
  return servicios.reduce((accumulator, servicio) => {
    const { cliente } = servicio;
    const clienteId = cliente._id.toString();

    const servicioData = {
      numero_llamada: servicio.numero_llamada,
      marca: servicio.marca,
      turno: servicio.turno,
      encargado: servicio.encargado,
      producto: servicio.producto,
      tipo_servicio: servicio.tipo_servicio,
      comentario: servicio.comentario,
      color: servicio.color,
    };

    const foundIndex = accumulator.findIndex(
      (item) => item.cliente._id.toString() === clienteId
    );

    if (foundIndex !== -1) {
      accumulator[foundIndex].servicios.push(servicioData);
    } else {
      accumulator.push({
        cliente,
        servicios: [servicioData],
      });
    }

    return accumulator;
  }, []);
};

const makeDescription = (servicios) => {
  let productos = "";
  let comentarios = " ";
  let numeroLlamada = "";

  servicios.map((servicio, i) => {
    if (i != 0) {
      productos += " - ";
      numeroLlamada += "\n";
    }
    if (i != 0 && servicio.comentario != "") comentarios += " // ";

    productos += `${servicio.producto} (${servicio.tipo_servicio})`;
    comentarios += servicio.comentario;
    numeroLlamada += servicio.marca + " / " + servicio.numero_llamada;
  });

  return { productos, comentarios, numeroLlamada };
};
