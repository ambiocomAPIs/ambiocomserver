// controllers/usuarioController.js
import Usuario from '../models/UsuariosAmbiocomExtrasModels.js';

export const obtenerUsuarios = async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const filtro = {};
    if (mes) filtro.mes = Number(mes);
    if (anio) filtro.anio = Number(anio);

    const usuarios = await Usuario.find(filtro);

    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    await usuario.save();
    res.status(201).json({ message: 'Usuario creado correctamente', usuario });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
};
