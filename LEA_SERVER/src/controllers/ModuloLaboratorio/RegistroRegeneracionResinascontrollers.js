import AnalisisAgua from "../../models/ModuloLaboratorio/RegistroRegeneracionResinasmodels.js";

export const createAnalisisAgua = async (req, res) => {
    try {
        const { fechaRegistro, rows } = req.body;

        if (!fechaRegistro) {
            return res.status(400).json({
                ok: false,
                message: "La fecha de registro es obligatoria.",
            });
        }

        if (!Array.isArray(rows)) {
            return res.status(400).json({
                ok: false,
                message: "La data de la tabla debe enviarse en rows.",
            });
        }

        const exists = await AnalisisAgua.findOne({
            fechaRegistro,
        });

        if (exists) {
            return res.status(409).json({
                ok: false,
                message: "Ya existe un registro para esta fecha.",
                data: exists,
            });
        }

        const data = await AnalisisAgua.create({
            fechaRegistro,
            rows,
        });

        return res.status(201).json({
            ok: true,
            message: "Registro guardado correctamente.",
            id: data._id,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: error.message || "Error al guardar el registro.",
        });
    }
};

export const getFechasAnalisisAgua = async (req, res) => {
    try {
        const fechas = await AnalisisAgua.distinct(
            "fechaRegistro"
        );

        return res.json({
            ok: true,
            fechas,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                "Error al consultar fechas.",
        });
    }
};

export const updateAnalisisAgua = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaRegistro, rows } = req.body;

        if (!Array.isArray(rows)) {
            return res.status(400).json({
                ok: false,
                message: "La data de la tabla debe enviarse en rows.",
            });
        }

        const data = await AnalisisAgua.findByIdAndUpdate(
            id,
            {
                fechaRegistro,
                rows,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!data) {
            return res.status(404).json({
                ok: false,
                message: "Registro no encontrado.",
            });
        }

        return res.json({
            ok: true,
            message: "Registro actualizado correctamente.",
            id: data._id,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: error.message || "Error al actualizar el registro.",
        });
    }
};

export const getAnalisisAguaByDate = async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({
                ok: false,
                message: "La fecha de consulta es obligatoria.",
            });
        }

        const data = await AnalisisAgua.findOne({
            fechaRegistro: fecha,
        });

        return res.json({
            ok: true,
            message: data
                ? "Registro encontrado."
                : "No hay registro para esta fecha.",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                "Error al consultar por fecha.",
        });
    }
};

export const getLatestAnalisisAgua = async (req, res) => {
    try {
        const data = await AnalisisAgua.findOne().sort({
            createdAt: -1,
        });

        return res.json({
            ok: true,
            message: data
                ? "Último registro encontrado."
                : "No hay registros.",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                "Error al consultar el último registro.",
        });
    }
};

export const getAllAnalisisAgua = async (req, res) => {
    try {
        const data = await AnalisisAgua.find().sort({
            createdAt: -1,
        });

        return res.json({
            ok: true,
            total: data.length,
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                "Error al listar registros.",
        });
    }
};

export const deleteAnalisisAgua = async (req, res) => {
    try {
        const { id } = req.params;

        const data =
            await AnalisisAgua.findByIdAndDelete(id);

        if (!data) {
            return res.status(404).json({
                ok: false,
                message: "Registro no encontrado.",
            });
        }

        return res.json({
            ok: true,
            message: "Registro eliminado correctamente.",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message:
                error.message ||
                "Error al eliminar el registro.",
        });
    }
};