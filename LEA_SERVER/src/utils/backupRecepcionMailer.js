
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import * as XLSX from "xlsx";
import { obtenerRecepcionParaBackup } from "./data/Modulo_Logistica/RecepcionLogisticaBackupData.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_EMAIL_USER,
    pass: process.env.app_password_gmail,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const limpiarLecturas = (lecturas = {}) => {
  const salida = {};

  Object.entries(lecturas).forEach(([key, value]) => {
    if (key.includes("__input")) return;
    salida[key] = value ?? "";
  });

  return salida;
};

const generarFilasExcel = (recepciones) => {
  return recepciones.map((row) => ({
    Fecha_Registro: row.fecha ?? "",
    Responsable_Recibo: row.responsable ?? "",
    Observaciones: row.observaciones ?? "",
    ...limpiarLecturas(row.lecturas),
  }));
};

const generarExcelBuffer = async () => {
  const recepciones = await obtenerRecepcionParaBackup();

  const filas = generarFilasExcel(recepciones);

  const worksheet = XLSX.utils.json_to_sheet(filas);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Recepciones");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return {
    excelBuffer,
    totalRegistros: filas.length,
  };
};

const enviarBackupRecepciones = async () => {
  try {
    const { excelBuffer, totalRegistros } = await generarExcelBuffer();

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");

    const nombreArchivo = `backup_recepciones_${yyyy}-${mm}-${dd}.xlsx`;

    const html = `
      <img 
        src="https://ambiocomsassgc.netlify.app/LogoCompany/logoambiocomsinfondo.png"
        width="200"
        style="margin-bottom:15px;"
      />
      <h2>Backup automático de recepciones</h2>
      <p>Se adjunta el archivo Excel generado automáticamente por el sistema.</p>
      <p><strong>Total registros exportados:</strong> ${totalRegistros}</p>
      <p><strong>Fecha de generación:</strong> ${yyyy}-${mm}-${dd}</p>
      <p>AMBIOCOM SAS</p>
    `;

    const mailOptions = {
      from: process.env.NODE_EMAIL_USER,
      to: process.env.NODE_TO,
      cc: process.env.NODE_TO_COPIA,
      subject: `Backup diario recepciones - ${yyyy}-${mm}-${dd}`,
      html,
      attachments: [
        {
          filename: nombreArchivo,
          content: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Backup de recepciones enviado:", info.response);
    return info;
  } catch (error) {
    console.error("Error enviando backup de recepciones:", error);
    throw error;
  }
};

export { enviarBackupRecepciones };