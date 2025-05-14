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

// POST - Crear nuevo registro
export const crearNivel = async (req, res) => {
  try {
    const nuevoNivel = new NivelDiarioJornalerosLogistica(req.body);
    const resultado = await nuevoNivel.save();
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ message: 'Error al guardar el registro', error });
  }
};

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