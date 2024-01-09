import Servicio from "../models/servicio.model.js";
import ExcelJS from "exceljs";
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

export const downloadExcel = async (req, res) => {
  const { date } = req.params;

  const day = new Date(date);

  const servicios = await Servicio.find({ fecha_visita: day }).populate({
    path: "cliente",
    select: "nombre_apellido num_telefono distrito direccion referencia",
  });

  if (servicios.length === 0)
    return res.status(500).json({ message: "No hay servicios para mostrar" });

  const sortedServicios = ordenarServiciosPorDistrito(servicios);

  const serviciosPorCliente = groupServicesByClient(sortedServicios);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Servicios");

  worksheet.columns = [
    { header: "Número de Llamada", key: "numeroLlamada", width: 15 },
    { header: "Descripción", key: "descripcion", width: 80 },
    { header: "Turno", key: "turno", width: 10 },
    { header: "Color", key: "color", width: 15 },
    { header: "Encargado", key: "encargado", width: 20 },
  ];

  serviciosPorCliente.forEach((servicio) => {
    const { cliente, servicios } = servicio;
    const { productos, comentarios, numeroLlamada } =
      makeDescription(servicios);
    const turno = servicios[0].turno.toUpperCase();

    const row = worksheet.addRow({
      numeroLlamada: numeroLlamada.toUpperCase(),
      descripcion: "",
      turno,
      color: colorDescriptions[servicios[0].color],
      encargado: servicios[0].encargado.toUpperCase(),
    });

    const descriptionText = [
      { text: cliente.nombre_apellido.toUpperCase(), font: { bold: true } },
      {
        text: ` ${cliente.num_telefono.toUpperCase()} `,
        font: { color: { argb: "FF0000" }, bold: true },
      },
      {
        text: ` ${cliente.distrito.toUpperCase()} `,
        font: { color: { argb: "800080" }, bold: true },
      },
      {
        text: ` ${cliente.direccion.toUpperCase()} Ref/ ${cliente.referencia.toUpperCase()} - ${productos.toUpperCase()} `,
        font: { bold: true },
      },
      {
        text: `${comentarios.toUpperCase()}`,
        font: { color: { argb: "FF0000" }, bold: true },
      },
    ];
    worksheet.getCell(`A${row.number}`).value = {
      richText: [
        {
          text: numeroLlamada.toUpperCase(),
          font: { bold: true, color: { argb: "008000" } }, // Texto en negrita y color verde
        },
      ],
    };

    worksheet.getCell(`B${row.number}`).value = { richText: descriptionText };

    const turnoCell = worksheet.getCell(`C${row.number}`);
    turnoCell.font = { bold: true };
    if (turno === "T/M" || turno === "T/T") {
      turnoCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
    }

    const colorCell = worksheet.getCell(`D${row.number}`);
    if (colorDescriptions[servicios[0].color]) {
      colorCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: getColorCode(servicios[0].color) },
      };
      colorCell.font = { bold: true };
    }

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        wrapText: true,
        vertical: "middle",
      };
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=servicios.xlsx");

  await workbook.xlsx.write(res);

  res.end();
};

const getColorCode = (colorDescription) => {
  switch (colorDescription) {
    case "PINK":
      return "FFC0CB"; // Rosa
    case "GRAY":
      return "808080"; // Gris
    case "BLUE":
      return "0000FF"; // Azul
    case "YELLOW":
      return "FFFF00"; // Amarillo
    case "ORANGE":
      return "FFA500"; // Naranja
    case "RED":
      return "FF0000"; // Rojo
    case "PURPLE":
      return "800080"; // Morado
    default:
      return "FFFFFF"; // Blanco (si no hay coincidencia)
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
