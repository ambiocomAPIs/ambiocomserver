import NivelDiarioJornalerosLogistica from "../../models/Context/nivelesTanquesJornalerosModels.js";
import XLSX from "xlsx";

/*
  Normaliza números que pueden venir con coma o punto.
  Ejemplos:
  "96,2" -> 96.2
  "96.2" -> 96.2
  ""     -> undefined
*/
const normalizarNumeroOpcional = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return undefined;
  }

  const normalizado =
    typeof valor === "string"
      ? valor.trim().replace(/\s/g, "").replace(",", ".")
      : valor;

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : undefined;
};

/*
  Normaliza números obligatorios o de operación.
  Si no logra convertir, retorna 0.
*/
const normalizarNumeroSeguro = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }

  const normalizado =
    typeof valor === "string"
      ? valor.trim().replace(/\s/g, "").replace(",", ".")
      : valor;

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
};

// GET - Obtener todos los registros
export const obtenerNiveles = async (req, res) => {
  try {
    const niveles = await NivelDiarioJornalerosLogistica.find().sort({
      createdAt: -1,
    });

    res.status(200).json(niveles);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los registros",
      error,
    });
  }
};

// POST - Crear niveles diarios
export const crearNivel = async (req, res) => {
  const datos = req.body;

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(400).json({
      message: "Se debe enviar un array de datos.",
    });
  }

  const resultados = [];
  const errores = [];

  for (const dato of datos) {
    try {
      const {
        NombreTanque,
        NivelTanque,
        Responsable,
        Observaciones,
        FechaRegistro,
        Factor,
        Disposicion,
        GradoAlcoholico,
      } = dato;

      // Validaciones básicas
      if (!NombreTanque) {
        throw new Error("El campo NombreTanque es obligatorio.");
      }

      if (NivelTanque === undefined || NivelTanque === null) {
        throw new Error("El campo NivelTanque es obligatorio.");
      }

      if (!FechaRegistro) {
        throw new Error("El campo FechaRegistro es obligatorio.");
      }

      // Validar formato de la fecha
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(FechaRegistro)) {
        throw new Error("La fecha debe estar en el formato YYYY-MM-DD.");
      }

      // Verificar duplicados por tanque y fecha
      const existeRegistro = await NivelDiarioJornalerosLogistica.findOne({
        NombreTanque,
        FechaRegistro,
      });

      if (existeRegistro) {
        throw new Error(
          `Ya existe un registro para el tanque ${NombreTanque} en la fecha ${FechaRegistro}.`
        );
      }

      // Guardar nuevo registro
      const nuevoNivel = new NivelDiarioJornalerosLogistica({
        NombreTanque,
        NivelTanque: normalizarNumeroSeguro(NivelTanque),
        Responsable: Responsable || "",
        Observaciones: Observaciones || "",
        FechaRegistro,
        Factor,
        Disposicion,
        GradoAlcoholico: normalizarNumeroOpcional(GradoAlcoholico),
      });

      const resultado = await nuevoNivel.save();
      resultados.push(resultado);
    } catch (error) {
      console.error(
        `Error al procesar tanque ${dato?.NombreTanque}:`,
        error.message
      );

      errores.push({
        dato,
        error: error.message,
      });
    }
  }

  res.status(207).json({
    message: "Proceso de carga finalizado.",
    exitosos: resultados.length,
    errores,
    data: {
      guardados: resultados,
      fallidos: errores,
    },
  });
};

// POST - Carga masiva Excel
export const cargarExcelNivelesTanquesJornaleros = async (req, res) => {
  const file = req.files?.excelFile;

  if (!file) {
    return res.status(400).json({
      message: "No se ha cargado ningún archivo",
    });
  }

  try {
    const workbook = XLSX.read(file.data, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    });

    let procesados = 0;
    let errores = [];

    /*
      Formato anterior compatible:
      [Tanque, Fecha, Nivel, Responsable, Disposicion, Factor, Observaciones]

      Nuevo formato compatible:
      [Tanque, Fecha, Nivel, Responsable, Disposicion, Factor, GradoAlcoholico, Observaciones]
    */
    for (let i = 1; i < data.length; i++) {
      try {
        const fila = data[i];

        const Tanque = fila[0];
        const Fecha = fila[1];
        const Nivel = fila[2];
        const Responsable = fila[3];
        const Disposicion = fila[4];
        const Factor = fila[5];

        const GradoAlcoholico = fila.length >= 8 ? fila[6] : "";
        const Observaciones = fila.length >= 8 ? fila[7] : fila[6];

        if (!Tanque || !Fecha) {
          console.warn("Fila inválida omitida:", fila);
          continue;
        }

        // Parse fecha: string, Date o serial de Excel
        let fechaString = Fecha;

        if (Fecha instanceof Date) {
          fechaString = Fecha.toISOString().split("T")[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(Fecha))) {
          fechaString = String(Fecha);
        } else {
          const fechaExcel = XLSX.SSF.parse_date_code(Fecha);

          if (!fechaExcel) {
            throw new Error("La fecha no tiene un formato válido.");
          }

          fechaString = new Date(
            fechaExcel.y,
            fechaExcel.m - 1,
            fechaExcel.d
          )
            .toISOString()
            .split("T")[0];
        }

        const nivelParseado = normalizarNumeroSeguro(Nivel);

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
          GradoAlcoholico: normalizarNumeroOpcional(GradoAlcoholico),
          Observaciones: Observaciones || "",
        };

        await NivelDiarioJornalerosLogistica.findOneAndUpdate(
          filtro,
          actualizacion,
          {
            upsert: true,
            new: true,
            runValidators: true,
          }
        );

        procesados++;
      } catch (err) {
        console.error("Error en fila:", data[i], err.message);

        errores.push({
          fila: i + 1,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      message: "Archivo procesado correctamente",
      procesados,
      errores,
    });
  } catch (error) {
    console.error("❌ Error al procesar el archivo Excel:", error);

    res.status(500).json({
      message: "Error al procesar el archivo Excel",
      error,
    });
  }
};

// GET - Obtener registros por FechaRegistro yyyy-mm-dd
export const obtenerNivelesPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(fecha)) {
      return res.status(400).json({
        message: "La fecha debe estar en formato YYYY-MM-DD",
      });
    }

    const registros = await NivelDiarioJornalerosLogistica.find({
      FechaRegistro: fecha,
    }).sort({
      NombreTanque: 1,
    });

    if (!registros || registros.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(registros);
  } catch (error) {
    console.error("❌ Error al consultar por fecha:", error);

    res.status(500).json({
      message: "Error al consultar por fecha",
      error,
    });
  }
};

// GET - Obtener niveles para Excel mediante API Key
export const obtenerNivelesExcel = async (req, res) => {
  try {
    const {
      fechaDesde,
      fechaHasta,
      tanque,
      limite = 10000,
    } = req.query;

    const filtro = {};

    if (fechaDesde || fechaHasta) {
      filtro.FechaRegistro = {};

      if (fechaDesde) {
        filtro.FechaRegistro.$gte = fechaDesde;
      }

      if (fechaHasta) {
        filtro.FechaRegistro.$lte = fechaHasta;
      }
    }

    if (tanque) {
      filtro.NombreTanque = tanque;
    }

    const limiteSeguro = Math.min(
      Math.max(Number(limite) || 10000, 1),
      50000
    );

    const niveles = await NivelDiarioJornalerosLogistica.find(filtro)
      .sort({
        FechaRegistro: -1,
        NombreTanque: 1,
      })
      .limit(limiteSeguro)
      .lean();

    const datosExcel = niveles.map((registro) => {
      const {
        _id,
        __v,
        ...datos
      } = registro;

      return datos;
    });

    return res.status(200).json({
      success: true,
      total: datosExcel.length,
      data: datosExcel,
    });
  } catch (error) {
    console.error("Error obteniendo niveles para Excel:", error);

    return res.status(500).json({
      success: false,
      message: "Error al obtener niveles para Excel",
      error: error.message,
    });
  }
};

// DELETE - Eliminar registros por FechaRegistro
export const eliminarPorFechaRegistro = async (req, res) => {
  const { FechaRegistro } = req.body;

  if (!FechaRegistro) {
    return res.status(400).json({
      message: "Debe proporcionar el campo FechaRegistro.",
    });
  }

  try {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(FechaRegistro)) {
      return res.status(400).json({
        message: "La fecha debe estar en el formato YYYY-MM-DD.",
      });
    }

    const registros = await NivelDiarioJornalerosLogistica.find({
      FechaRegistro,
    });

    if (registros.length === 0) {
      return res.status(404).json({
        message: `No se encontraron registros con la fecha ${FechaRegistro}.`,
      });
    }

    const ids = registros.map((reg) => reg._id);

    await NivelDiarioJornalerosLogistica.deleteMany({
      _id: {
        $in: ids,
      },
    });

    res.status(200).json({
      message: `Registros eliminados correctamente para la fecha ${FechaRegistro}.`,
      eliminados: registros.length,
      ids,
    });
  } catch (error) {
    console.error("Error al eliminar registros por fecha:", error);

    res.status(500).json({
      message: "Error al eliminar registros por fecha.",
      error,
    });
  }
};

// PUT - Actualizar registros por FechaRegistro
export const actualizarNivelesPorFecha = async (req, res) => {
  const datos = req.body;

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(400).json({
      message: "Se debe enviar un array de datos.",
    });
  }

  try {
    const { FechaRegistro } = datos[0];

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(FechaRegistro)) {
      return res.status(400).json({
        message: "La fecha debe estar en formato YYYY-MM-DD.",
      });
    }

    await NivelDiarioJornalerosLogistica.deleteMany({
      FechaRegistro,
    });

    const nuevos = await NivelDiarioJornalerosLogistica.insertMany(
      datos.map((d) => ({
        NombreTanque: d.NombreTanque,
        NivelTanque: normalizarNumeroSeguro(d.NivelTanque),
        Responsable: d.Responsable || "",
        Observaciones: d.Observaciones || "",
        FechaRegistro: d.FechaRegistro,
        Factor: d.Factor,
        Disposicion: d.Disposicion,
        GradoAlcoholico: normalizarNumeroOpcional(d.GradoAlcoholico),
      }))
    );

    res.status(200).json({
      message: "Registros actualizados correctamente",
      actualizados: nuevos.length,
      data: nuevos,
    });
  } catch (error) {
    console.error("❌ Error al actualizar por fecha:", error);

    res.status(500).json({
      message: "Error al actualizar los registros",
      error,
    });
  }
};

// GET - Resumen de niveles de tanques jornaleros para la bitácora
export const obtenerResumenNivelesTanquesBitacora = async (req, res) => {
  try {
    const { fecha } = req.params;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(String(fecha || ""))) {
      return res.status(400).json({
        success: false,
        message: "La fecha debe estar en formato YYYY-MM-DD.",
      });
    }

    const registros = await NivelDiarioJornalerosLogistica.find({
      FechaRegistro: fecha,
    })
      .sort({
        NombreTanque: 1,
      })
      .lean();

    const detalle = registros.map((registro) => {
      const nivel = normalizarNumeroSeguro(registro.NivelTanque);
      const factor = normalizarNumeroSeguro(registro.Factor);
      const gradoAlcoholico = normalizarNumeroOpcional(
        registro.GradoAlcoholico
      );

      const volumen = nivel * factor;

      return {
        tanque: registro.NombreTanque || "Sin definir",
        disposicion: registro.Disposicion || "Sin definir",
        nivel,
        factor,
        gradoAlcoholico,
        volumen,
        responsable: registro.Responsable || "",
        observaciones: registro.Observaciones || "",
      };
    });

    const volumenTotal = detalle.reduce(
      (acumulado, item) =>
        acumulado + normalizarNumeroSeguro(item.volumen),
      0
    );

    const exists = detalle.length > 0;

    return res.status(200).json({
      success: true,
      exists,
      message: exists
        ? "Niveles de tanques jornaleros consultados correctamente."
        : "No se encontraron niveles de tanques jornaleros para la fecha consultada.",
      data: {
        fecha,
        totalRegistros: detalle.length,
        volumenTotal,
        detalle,
      },
    });
  } catch (error) {
    console.error(
      "Error obteniendo niveles de tanques jornaleros para la bitácora:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error al obtener los niveles de tanques jornaleros para la bitácora.",
      error: error.message,
    });
  }
};