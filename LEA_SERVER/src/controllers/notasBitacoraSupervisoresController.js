import mongoose from 'mongoose';
import dotenv from "dotenv"
dotenv.config();

import NotasBitacoraSupervisores from "../models/notasBitacorasSupervisoresModels.js";


// GET /notes?module=PENDIENTES
export const getNotes = async (req, res) => {
  try {
    const module = req.query.module;
    let filter = {};
    if (module) filter.module = module;

    const notes = await NotasBitacoraSupervisores.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener notas", error });
  }
};

// POST /notes
import Note from "../models/notasBitacorasSupervisoresModels.js";

export const createNote = async (req, res) => {
  try {
    const { text, date, turno, supervisor, module } = req.body;

    // Validación de campos requeridos
    if (!text || !date || !turno || !supervisor || !module) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const newNote = new Note({
      text,
      date,
      turno,
      supervisor,
      module,
      completed: false,
    });

    await newNote.save();
    return res.status(201).json(newNote);
  } catch (error) {
    console.error("Error al crear nota:", error);
    return res.status(500).json({ message: "Error al crear nota", error });
  }
};


// PATCH /notes/:id/toggle
export const toggleComplete = async (req, res) => {
  try {
    const note = await NotasBitacoraSupervisores.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    note.completed = !note.completed;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar nota", error });
  }
};

// Controlador para eliminar una nota por su ID
export const deleteNoteById = async (req, res) => {
  const { id } = req.params; 
  const password = req.headers.authorization?.replace('Bearer ', '');
  // const { password } = req.query; 
  const PASSWORD_CORRECTA = process.env.ADMIN_PASSWORD;

  // Validar que el id sea un ObjectId válido de Mongo
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // Validar la contraseña
  if (password !== PASSWORD_CORRECTA) {
    return res.status(401).json({ message: "Contraseña incorrecta." });
  }

  try {
    // Intentar eliminar la nota
    const deleted = await NotasBitacoraSupervisores.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Nota no encontrada." });
    }

    res.status(200).json({ message: "Nota eliminada correctamente." });
  } catch (error) {
    console.error("❌ Error al eliminar nota:", error);
    res.status(500).json({ message: "Error al eliminar la nota." });
  }
};
