import NivelDiarioJornalerosLogistica from '../models/nivelesTanquesJornalerosModels.js';
import XLSX from 'xlsx';

// GET - Obtener todos los registros
export const obtenerNiveles = async (req, res) => {
  try {
    const niveles = await NivelDiarioJornalerosLogistica.find().sort({ createdAt: -1 });
    res.status(200).json(niveles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los registros', error });
  }
};

export const crearNivel = async (req, res) => {
  const datos = req.body;

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(400).json({ message: 'Se debe enviar un array de datos.' });
  }

  const resultados = [];
  const errores = [];

  for (const dato of datos) {
    try {

      const { NombreTanque, NivelTanque, Responsable, Observaciones, FechaRegistro, Factor, Disposicion } = dato;

      // Validaciones básicas
      if (!NombreTanque) throw new Error('El campo NombreTanque es obligatorio.');
      if (NivelTanque === undefined || NivelTanque === null) throw new Error('El campo NivelTanque es obligatorio.');
      if (!FechaRegistro) throw new Error('El campo FechaRegistro es obligatorio.');
      // Validar formato de la fecha
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(FechaRegistro)) {
        throw new Error('La fecha debe estar en el formato YYYY-MM-DD.');
      }

      // Verificar duplicados por tanque y fecha
      const existeRegistro = await NivelDiarioJornalerosLogistica.findOne({ NombreTanque, FechaRegistro });
      if (existeRegistro) {
        throw new Error(`Ya existe un registro para el tanque ${NombreTanque} en la fecha ${FechaRegistro}.`);
      }

      // Guardar nuevo registro
      const nuevoNivel = new NivelDiarioJornalerosLogistica({
        NombreTanque,
        NivelTanque,
        Responsable: Responsable || '',
        Observaciones: Observaciones || '',
        FechaRegistro,
        Factor,
        Disposicion
      });

      const resultado = await nuevoNivel.save();
      resultados.push(resultado);

    } catch (error) {
      console.error(`Error al procesar tanque ${dato.NombreTanque}:`, error.message);
      errores.push({ dato, error: error.message });
    }
  }

  res.status(207).json({
    message: 'Proceso de carga finalizado.',
    exitosos: resultados.length,
    errores,
    data: {
      guardados: resultados,
      fallidos: errores,
    },
  });
};

//carga masiva excel

export const cargarExcelNivelesTanquesJornaleros = async (req, res) => {
  const file = req.files?.excelFile;

  if (!file) {
    return res.status(400).json({ message: "No se ha cargado ningún archivo" });
  }

  try {
    const workbook = XLSX.read(file.data, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let procesados = 0;
    let errores = [];

    // Suponemos encabezado: [Tanque, Fecha, Nivel, Responsable, Disposicion, Factor, Observaciones]
    for (let i = 1; i < data.length; i++) {
      try {
        const [Tanque, Fecha, Nivel, Responsable, Disposicion, Factor, Observaciones] = data[i];

        if (!Tanque || !Fecha) {
          console.warn("Fila inválida omitida:", data[i]);
          continue;
        }

        // Parse fecha (string o Excel date)
        let fechaString = Fecha;
        if (Fecha instanceof Date) {
          fechaString = Fecha.toISOString().split("T")[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(Fecha)) {
          fechaString = Fecha; // ya viene como yyyy-mm-dd
        } else {
          // si es número (fecha serial de Excel)
          const fechaExcel = XLSX.SSF.parse_date_code(Fecha);
          fechaString = new Date(
            fechaExcel.y,
            fechaExcel.m - 1,
            fechaExcel.d
          )
            .toISOString()
            .split("T")[0];
        }

        // Parse nivel
        const nivelParseado =
          typeof Nivel === "string"
            ? parseFloat(Nivel.replace(",", "."))
            : Nivel || 0;

        const filtro = {
          NombreTanque: Tanque,
          FechaRegistro: fechaString,
        };

        const actualizacion = {
          NombreTanque: Tanque,
          FechaRegistro: fechaString,
          NivelTanque: nivelParseado,
          Responsable: Responsable || "",
          Disposicion: Disposicion || "",
          Factor: Factor || "",
          Observaciones: Observaciones || "",
        };

        await NivelDiarioJornalerosLogistica.findOneAndUpdate(
          filtro,
          actualizacion,
          { upsert: true, new: true }
        );

        procesados++;
      } catch (err) {
        console.error("Error en fila:", data[i], err.message);
        errores.push({ fila: i + 1, error: err.message });
      }
    }

    res.status(200).json({
      message: "Archivo procesado correctamente",
      procesados,
      errores,
    });
  } catch (error) {
    console.error("❌ Error al procesar el archivo Excel:", error);
    res.status(500).json({ message: "Error al procesar el archivo Excel", error });
  }
};

// DELETE - Eliminar registros por FechaRegistro
export const eliminarPorFechaRegistro = async (req, res) => {
  const { FechaRegistro } = req.body; 
  
  if (!FechaRegistro) {
    return res.status(400).json({ message: 'Debe proporcionar el campo FechaRegistro.' });
  }

  try {
    // Validar formato de la fecha
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(FechaRegistro)) {
      return res.status(400).json({ message: 'La fecha debe estar en el formato YYYY-MM-DD.' });
    }
    // Buscar documentos con esa fecha
    const registros = await NivelDiarioJornalerosLogistica.find({ FechaRegistro });

    if (registros.length === 0) {
      return res.status(404).json({ message: `No se encontraron registros con la fecha ${FechaRegistro}.` });
    }
    // Obtener los IDs de los registros
    const ids = registros.map(reg => reg._id);
    // Eliminar por ID
    await NivelDiarioJornalerosLogistica.deleteMany({ _id: { $in: ids } });
    res.status(200).json({
      message: `Registros eliminados correctamente para la fecha ${FechaRegistro}.`,
      eliminados: registros.length,
      ids,
    });

  } catch (error) {
    console.error('Error al eliminar registros por fecha:', error);
    res.status(500).json({ message: 'Error al eliminar registros por fecha.', error });
  }
};