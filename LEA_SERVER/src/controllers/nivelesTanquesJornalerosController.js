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

  try {
    const resultados = await Promise.all(
      datos.map(async (dato) => {
        const { NombreTanque, NivelTanque, Responsable, Observaciones, FechaRegistro } = dato;

        if (!NombreTanque) {
          throw new Error('El campo NombreTanque es obligatorio.');
        }
        if (NivelTanque === undefined || NivelTanque === null) {
          throw new Error('El campo NivelTanque es obligatorio.');
        }
        if (!FechaRegistro) {
          throw new Error('El campo FechaRegistro es obligatorio.');
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(FechaRegistro)) {
          throw new Error('La fecha debe estar en el formato YYYY-MM-DD.');
        }

        // Verificar si ya existe un registro con la misma fecha
        const existeRegistro = await NivelDiarioJornalerosLogistica.findOne({ FechaRegistro });
        if (existeRegistro) {
          throw new Error(`Ya existe un registro para la fecha ${FechaRegistro}.`);
        }

        const nuevoNivel = new NivelDiarioJornalerosLogistica({
          NombreTanque,
          NivelTanque,
          Responsable: Responsable || '',
          Observaciones: Observaciones || '',
          FechaRegistro,
        });

        return await nuevoNivel.save();
      })
    );

    res.status(201).json({
      message: 'Registros creados correctamente.',
      data: resultados,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar los registros', error: error.message });
  }
};

//carga masiva excel

export const cargarExcelNivelesTanquesJornaleros = async (req, res) => {
  const file = req.files?.excelFile;

  if (!file) {
    return res.status(400).json({ message: 'No se ha cargado ningún archivo' });
  }

  try {
    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let actualizados = 0;
    let noEncontrados = [];

    // Iterar sobre las filas, comenzando desde la segunda (índice 1) para omitir el encabezado
    for (let i = 1; i < data.length; i++) {
      const [Tanque, Fecha, Nivel] = data[i];

      if (!Tanque || !Fecha || Nivel === undefined) {
        console.warn('Fila inválida omitida:', data[i]);
        continue;
      }

      try {
        // Convertir la fecha del Excel al formato 'yyyy-mm-dd'
        const fecha = new Date(Fecha);
        const fechaString = fecha.toISOString().split('T')[0];

        // Parsear el nivel, manejando el caso donde el número tiene coma en vez de punto
        const nivelParseado = typeof Nivel === 'string' ? parseFloat(Nivel.replace(',', '.')) : Nivel;

        const filtro = {
          NombreTanque: Tanque,
          FechaRegistro: fechaString,
        };

        const actualizacion = {
          NivelTanque: nivelParseado,
        };

        const resultado = await NivelDiarioJornalerosLogistica.findOneAndUpdate(
          filtro,
          actualizacion,
          { new: true }
        );

        if (resultado) {
          console.log(`✔ Actualizado: ${Tanque} - ${fechaString}`);
          actualizados++;
        } else {
          console.warn(`⚠ No encontrado: ${Tanque} - ${fechaString}`);
          noEncontrados.push({ Tanque, Fecha: fechaString });
        }
      } catch (error) {
        console.error('⚠ Error procesando fila:', data[i], error.message);
      }
    }

    res.status(200).json({
      message: 'Archivo procesado.',
      actualizados,
      noEncontrados,
    });
  } catch (error) {
    console.error('❌ Error al procesar el archivo Excel:', error);
    res.status(500).json({ message: 'Error al procesar el archivo Excel', error });
  }
};