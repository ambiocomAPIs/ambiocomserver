import { Types } from 'mongoose';
const { ObjectId } = Types;

// controllers/data.controller.js
import Data from '../models/dataModels.js';
import Pdf from '../models/pdfModel.js'


// Crear un nuevo datos
export const createData = async (req, res) => {
  try {
    const data = new Data(req.body); // req.body contiene los datos del datos
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reemplazar toda la data
// export const replaceAllData = async (req, res) => {
//   try {
    
//     // Elimina todos los PDFs de la base de datos
//     await Pdf.deleteMany({}); 
//     // Borrar todos los datos existentes
//     //await Data.deleteMany({});

//     // Insertar la nueva data
//     const newData = await Data.insertMany(req.body); // req.body contiene la nueva data

//     // Retornar la nueva data insertada
//     res.status(200).json(newData);
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ error: error.message });
//   }
// };

// Obtener todos los datoss
export const getAllDatas = async (req, res) => {
  try {
    const datas = await Data.find();
    res.status(200).json(datas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un datos por ID
export const getDataById = async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: 'Datos no encontrado' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un datos
export const updateData = async (req, res) => {
  try {
    const data = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) {
      return res.status(404).json({ message: 'Datos no encontrado' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un datos
export const deleteData = async (req, res) => {

  // Validación del ObjectId
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Id no válido' });
  }

  try {
    // Intentar eliminar el documento
    const data = await Data.findByIdAndDelete(req.params.id);

    // Verificar si el documento fue encontrado y eliminado
    if (!data) {
      // Si el documento no se encuentra, enviar mensaje de error
      return res.status(404).json({ message: 'Fila no encontrada' });
    }

    // Si se eliminó correctamente, enviar un mensaje de éxito
    return res.status(200).json({ message: 'Fila eliminada correctamente', data });

  } catch (error) {
    // En caso de error en la base de datos
    console.error("Error al eliminar:", error);
    return res.status(400).json({ error: error.message });
  }
};

// gasto mensual
export const reportarOperacion = async (req, res) => {
  
  try {
    const {
      Producto,
      Lote,
      ConsumoAReportar,
      TipoOperacion,
      Costo, // Costo unitario recibido en la solicitud
    } = req.body;

    // Validamos que Costo sea un número válido
    const costoUnitario = isNaN(Costo) ? 0 : parseFloat(Costo);
    const cantidad = parseFloat(ConsumoAReportar);    

    if (isNaN(cantidad)) {      
      return res.status(400).json({ message: 'Cantidad inválida' });
    }

    // Calcular el gasto mensual como la multiplicación del costo unitario y la cantidad consumida
    const gastoMensual = costoUnitario * cantidad;

    // Buscar el producto por nombre y lote
    const data = await Data.findOne({ nombre: Producto, lote: Lote });

    if (!data) {
      return res.status(404).json({ message: 'Producto con ese lote no encontrado' });
    }
        
    // Sumar o restar según el tipo de operación
    if (TipoOperacion === 'Consumo de Material' || TipoOperacion === 'Consumo de Insumo') {
      // Restar de inventario
      data.Inventario = (parseFloat(data.Inventario) || 0) - cantidad;
      // Sumar al consumo mensual
      data.ConsumoMensual = (parseFloat(data.ConsumoMensual) || 0) + cantidad;
      // Sumar el gasto mensual calculado
      data.GastoMensual = (parseFloat(data.GastoMensual) || 0) + gastoMensual;

    } else if (TipoOperacion === 'Ingreso Material' || TipoOperacion === 'Ingreso Insumo') {
      // Sumar al inventario
      data.Inventario = (parseFloat(data.Inventario) || 0) + cantidad;
      // Sumar la cantidad al campo cantidadIngreso
      data.cantidadIngreso = (parseFloat(data.cantidadIngreso) || 0) + cantidad;

      // No es necesario actualizar GastoMensual ni costoMensual en ingreso de material
    } else {
      return res.status(400).json({ message: 'Tipo de operación inválido' });
    }

    // Guardar los cambios
    await data.save();
    return res.status(200).json({ message: 'Inventario actualizado correctamente', data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la operación' });
  }
};

// Reemplazar toda la data
// export const replaceAllData = async (req, res) => {
//   try {

//     console.log("data de tabla:", req.body);
    
    
//     // Elimina todos los PDFs de la base de datos
//     await Pdf.deleteMany({}); 
//     // Borrar todos los datos existentes
//     await Data.deleteMany({});

//     // Insertar la nueva data
//     const newData = await Data.insertMany(req.body); // req.body contiene la nueva data

//     // Retornar la nueva data insertada
//     res.status(200).json(newData);
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ error: error.message });
//   }
// };

// no borrar la dara si no reemplazarla
export const replaceAllData = async (req, res) => {
  try {
    console.log("data de tabla:", req.body);

    const tableData = req.body;

    if (!Array.isArray(tableData)) {
      return res.status(400).json({ error: 'El cuerpo debe ser un arreglo de datos.' });
    }

    const updatedDocs = await Promise.all(
      tableData.map(async (item) => {
        if (!item._id) return null;

        const { _id, ...fieldsToUpdate } = item;

        return await Data.findByIdAndUpdate(
          _id,
          fieldsToUpdate,
          {
            new: true,
            upsert: true, // Crea si no existe
            runValidators: true, // Valida el modelo de Mongoose
          }
        );
      })
    );

    res.status(200).json(updatedDocs.filter(Boolean));
  } catch (error) {
    console.error('Error en replaceAllData:', error);
    res.status(400).json({ error: error.message });
  }
};