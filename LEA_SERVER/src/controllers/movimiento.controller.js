import ProductoDB from '../models/dataModels.js';  // Asegúrate de importar el modelo de Producto
import Movimiento from '../models/movimiento.model.js';  // El modelo de Movimiento está bien importado

export const obtenerMovimientos = async (req, res) => {
    try {
      // Desestructuramos los parámetros de búsqueda del query (pueden ser opcionales)
      const {
        tipoOperacion, // 'Consumo de Material' o 'Ingreso Material'
        producto,     // Nombre del producto
        fechaInicio,  // Fecha de inicio (puede ser en formato ISO string)
        fechaFin      // Fecha de fin (puede ser en formato ISO string)
      } = req.query;
  
      // Construir un objeto de filtro vacío para usar en la consulta
      let filtro = {};
  
      // Si se pasa tipoOperacion, filtramos por él
      if (tipoOperacion) {
        filtro.tipoOperacion = tipoOperacion;
      }
  
      // Si se pasa producto, buscamos el producto por nombre
      if (producto) {
        const productoEncontrado = await ProductoDB.findOne({ nombre: producto });
        if (!productoEncontrado) {
          return res.status(400).json({ message: 'Producto no encontrado' });
        }
        filtro.producto = producto;
      }
  
      // Si se pasan fechas, filtramos por ellas (formato de fecha ISO)
      if (fechaInicio && fechaFin) {
        filtro.createdAt = {
          $gte: new Date(fechaInicio),  // Mayor o igual que la fecha de inicio
          $lte: new Date(fechaFin)      // Menor o igual que la fecha de fin
        };
      }
  
      // Consultar los movimientos de acuerdo a los filtros definidos
      const movimientos = await Movimiento.find(filtro).sort({ createdAt: -1 });  // Ordenamos por fecha descendente
  
      // Si no se encontraron movimientos
      if (movimientos.length === 0) {
        return res.status(404).json({ message: 'No se encontraron movimientos que coincidan con los criterios.' });
      }
  
      // Responder con los movimientos encontrados
      res.status(200).json(movimientos);
    } catch (error) {
      console.error('Error al obtener los movimientos:', error);
      res.status(500).json({ message: 'Error al obtener los movimientos', error });
    }
  };
  
export const crearMovimiento = async (req, res) => {
  try {
    const {
      TipoOperación,
      Producto,
      Lote,
      Inventario,
      Unidad,
      Costo,
      Proveedor,
      Responsable,
      Area,
      ConsumoAReportar,
      ObservacionesAdicionales,
      SAP
    } = req.body;

    // Agregar un log para verificar los datos recibidos
    console.log('Datos recibidos:', req.body);

    // Validación de parámetros
    if (!Producto || !Lote) {
      return res.status(400).json({ message: 'Producto o Lote no pueden estar vacíos.' });
    }

    // Validar que el Tipo de Operación sea válido
    const tiposOperacionPermitidos = ['Consumo de Material', 'Ingreso Material'];
    if (!tiposOperacionPermitidos.includes(TipoOperación)) {
      return res.status(400).json({ message: 'Tipo de operación inválido. Debe ser "Consumo de Material" o "Ingreso Material".' });
    }

    // Buscar el producto y el lote en la base de datos
    const producto = await ProductoDB.findOne({ nombre: Producto, lote: Lote });
    if (!producto) {
      return res.status(400).json({ message: 'El lote seleccionado no corresponde al producto o no existe.' });
    }

    // Validar que ConsumoAReportar sea un número
    const consumoAReportar = Number(ConsumoAReportar);
    if (isNaN(consumoAReportar)) {
      return res.status(400).json({ message: 'Consumo a reportar debe ser un número válido.' });
    }

    // Calcular el consumo a registrar (positivo o negativo según el tipo de operación)
    let consumoARegistrar;
    if (TipoOperación === 'Consumo de Material') {
      consumoARegistrar = -Math.abs(consumoAReportar);  // Consumo negativo
    } else if (TipoOperación === 'Ingreso Material') {
      consumoARegistrar = Math.abs(consumoAReportar);  // Ingreso positivo
    }

    // Crear un nuevo movimiento
    const nuevoMovimiento = new Movimiento({
      tipoOperacion: TipoOperación,  // 'Consumo de Material' o 'Ingreso Material'
      producto: Producto,
      lote: Lote,
      inventario: Number(Inventario),
      unidad: Unidad,
      costoUnitario: Number(Costo),
      proveedor: Proveedor,
      responsable: Responsable,
      area: Area,
      consumoReportado: consumoARegistrar,
      ObservacionesAdicionales: ObservacionesAdicionales,
      SAP:SAP
    });

    // Guardar el movimiento en la base de datos
    const guardado = await nuevoMovimiento.save();
    
    // Responder con el movimiento guardado
    res.status(201).json(guardado);
    
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    res.status(500).json({ message: 'Error al registrar el movimiento', error });
  }
};
