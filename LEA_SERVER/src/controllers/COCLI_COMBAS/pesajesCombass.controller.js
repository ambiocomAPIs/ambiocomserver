
import PesajesCombass from "../../models/COCLI_COMBAS/pesajesCombass.model.js";

// GET - Últimos pesajes
export const obtenerPesajesCombass = async (req, res) => {
    try {
        const solicitado = Number(req.query.limit);
        const limit = Number.isInteger(solicitado) && solicitado > 0
            ? Math.min(solicitado, 500)
            : 50;

        const pesajes = await PesajesCombass.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return res.status(200).json({
            ok: true,
            total: pesajes.length,
            data: pesajes,
        });
    } catch (error) {
        console.error("[GET PESAJES COMBASS]", error);

        return res.status(500).json({
            ok: false,
            message: "Error consultando los pesajes",
        });
    }
};


export const obtenerPesajesCombassPorRango = async (req, res) => {
    try {
        const { from, to } = req.query;

        const validarFecha = (valor) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(valor ?? "")) return false;
            const fecha = new Date(`${valor}T00:00:00.000Z`);
            return !Number.isNaN(fecha.getTime()) &&
                fecha.toISOString().slice(0, 10) === valor;
        };

        if (!validarFecha(from) || !validarFecha(to) || from > to) {
            return res.status(400).json({
                ok: false,
                message: "Rango inválido. Utiliza from y to en formato YYYY-MM-DD.",
            });
        }

        const fechas = [];

        const actual = new Date(`${from}T00:00:00.000Z`);
        const final = new Date(`${to}T00:00:00.000Z`);

        while (actual <= final) {
            const dia = String(actual.getUTCDate()).padStart(2, "0");
            const mes = String(actual.getUTCMonth() + 1).padStart(2, "0");
            const anio = actual.getUTCFullYear();

            fechas.push(`${dia}/${mes}/${anio}`);

            actual.setUTCDate(actual.getUTCDate() + 1);
        }

        const pesajes = await PesajesCombass.find({
            fechaIngreso: { $in: fechas },
        }).lean();

        pesajes.sort((a, b) => {
            const fechaOrdenable = (fecha) => {
                const [dia, mes, anio] = String(fecha || "").split("/");
                return `${anio}-${mes}-${dia}`;
            };

            return (
                fechaOrdenable(a.fechaIngreso).localeCompare(fechaOrdenable(b.fechaIngreso)) ||
                String(a.horaIngreso || "").localeCompare(String(b.horaIngreso || ""))
            );
        });

        return res.status(200).json({
            ok: true,
            desde: from,
            hasta: to,
            total: pesajes.length,
            data: pesajes,
        });

    } catch (error) {
        console.error("[GET PESAJES COMBASS RANGO]", error);

        return res.status(500).json({
            ok: false,
            message: "Error consultando el rango de pesajes",
        });
    }
};
