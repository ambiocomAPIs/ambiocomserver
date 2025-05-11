import OperacionesDeTanques from '../models/OperacionesDeTanques.model.js';

export const crearMovimientoTanque = async (req, res) => {

  console.log("data que llega:", req.body);
  
  try {
    const {
      tipoDeMovimiento,
      tanqueOrigen,
      tanqueDestino,
      cantidad,
      responsable,
      cliente,
      detalleFactura,
      nivelFinal,
      observaciones,
    } = req.body;

    const movimiento = new OperacionesDeTanques({
      tipoDeMovimiento,
      tanqueOrigen,
      tanqueDestino,
      cantidad,
      responsable,
      cliente,
      detalleFactura,
      nivelFinal,
      observaciones,
    });

    const nuevoMovimiento = await movimiento.save();
    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el movimiento' });
  }
};
