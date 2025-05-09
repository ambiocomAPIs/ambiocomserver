
import Producto from '../models/dataModels.js'; // Asumiendo que tu modelo de Producto está en la carpeta models
import {sendEmailData} from '../utils/mailer.js'

export const sendEmail = async (req, res) => {
    const productos = req.body;

    console.log("productos que llegan al backend:", productos);
    
    try {
      productos.forEach((producto) => {
        const body = `El producto ${producto.nombre} con lote ${producto.lote} vence el ${producto.fechaVencimiento}.`;
        sendEmailData('Recordatorio de vencimiento', body);
      });
  
      res.status(200).json({ message: 'Avisos enviados correctamente' });
    } catch (error) {
      console.error('Error al procesar los avisos:', error);
      res.status(500).json({ message: 'Error al procesar los datos' });
    }
  };
  

//? Controlador para actualizar el estado "notificado" de un producto

export const notificarProducto = async (req, res) => {
  const { productoId } = req.params; // Recibir el ID del producto de la URL

  console.log("ejecutando notificar producto, id que llega:", productoId);
  
  try {
    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (producto.notificado) {
      producto.notificado = false;
      await producto.save();
      return res.status(200).json({ message: 'Se ha habilitado la alerta para este reactivo' });
    }else {
      // Actualizar el campo "notificado" a true si no estaba notificado
      producto.notificado = true;
      await producto.save();
    }

    return res.status(200).json({ message: 'Producto notificado correctamente' });
  } catch (error) {
    console.error('Error al notificar el producto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};