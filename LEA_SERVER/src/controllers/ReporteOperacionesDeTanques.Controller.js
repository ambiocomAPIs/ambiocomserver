import OperacionesDeTanques from '../models/OperacionesDeTanques.model.js';

export const GetMovimientoTanque = async (req, res) => {
  try {
    const movimientos = await OperacionesDeTanques.find().sort({ createdAt: -1 }); // Orden descendente por fecha
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    res.status(500).json({ message: 'Error al obtener los movimientos de tanques' });
  }
};

export const crearMovimientoTanque = async (req, res) => {
  
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
