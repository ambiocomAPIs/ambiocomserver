import mongoose from "mongoose";
import MaterialCombustible from "../../models/Modulo_Produccion/MaterialCombustibleDetails.model.js";

const MATERIAL_OPTIONS = ["Carbón", "Madera", "Bagazo"];

const normalizeMaterial = (value) => {
  const raw = String(value || "").trim().toLowerCase();

  if (raw.includes("madera")) return "Madera";
  if (raw.includes("bagazo")) return "Bagazo";

  return "Carbón";
};

const makeMaterialCode = (material, name) => {
  const base = `${material || "Carbón"}-${name || "material"}`;

  return (
    base
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `material-${Date.now()}`
  );
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const isMongoId = (value) =>
  mongoose.Types.ObjectId.isValid(String(value || ""));

const findMaterialByIdentifier = async (identifier) => {
  const value = String(identifier || "").trim();

  if (!value) return null;

  if (isMongoId(value)) {
    const byMongoId = await MaterialCombustible.findById(value);
    if (byMongoId) return byMongoId;
  }

  return MaterialCombustible.findOne({
    codigo: value.toLowerCase(),
  });
};

const mapMaterial = (row) => ({
  _id: row._id,
  mongoId: row._id,
  id: row.codigo,
  codigo: row.codigo,
  name: row.name,
  material: row.material,
  weightCV: row.weightCV,
  weightCN: row.weightCN,
  initialTon: row.initialTon,
  stockMinimoTon: row.stockMinimoTon,
  active: row.active,
  observacion: row.observacion || "",
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const buildPayload = (body = {}) => {
  const name = String(body.name || body.nombre || "").trim();
  const material = normalizeMaterial(body.material);

  const codigo = String(
    body.codigo || body.id || makeMaterialCode(material, name)
  )
    .trim()
    .toLowerCase();

  return {
    codigo,
    name,
    material,
    weightCV: toNumber(body.weightCV),
    weightCN: toNumber(body.weightCN),
    initialTon: toNumber(body.initialTon),
    stockMinimoTon: toNumber(body.stockMinimoTon),
    active: typeof body.active === "boolean" ? body.active : true,
    observacion: String(body.observacion || "").trim(),
  };
};

export const obtenerMaterialesCombustibles = async (req, res) => {
  try {
    const { active, activos, material, search } = req.query;

    const query = {};

    const activeParam = active ?? activos;

    if (activeParam !== undefined && activeParam !== "") {
      query.active = ["true", "1", "si", "sí"].includes(
        String(activeParam).toLowerCase()
      );
    }

    if (material && material !== "Todos") {
      query.material = normalizeMaterial(material);
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: String(search),
            $options: "i",
          },
        },
        {
          codigo: {
            $regex: String(search),
            $options: "i",
          },
        },
      ];
    }

    const materiales = await MaterialCombustible.find(query)
      .sort({
        active: -1,
        material: 1,
        name: 1,
      })
      .lean();

    return res.json({
      ok: true,
      total: materiales.length,
      materiales: materiales.map(mapMaterial),
    });
  } catch (error) {
    console.error("Error obteniendo materiales combustibles:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudieron consultar los materiales combustibles.",
      error: error.message,
    });
  }
};

export const obtenerMaterialesCombustiblesActivos = async (req, res) => {
  try {
    const materiales = await MaterialCombustible.find({
      active: true,
    })
      .sort({
        material: 1,
        name: 1,
      })
      .lean();

    return res.json({
      ok: true,
      total: materiales.length,
      materiales: materiales.map(mapMaterial),
    });
  } catch (error) {
    console.error("Error obteniendo materiales combustibles activos:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudieron consultar los materiales activos.",
      error: error.message,
    });
  }
};

export const crearMaterialCombustible = async (req, res) => {
  try {
    const payload = buildPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del material es obligatorio.",
      });
    }

    if (!MATERIAL_OPTIONS.includes(payload.material)) {
      return res.status(400).json({
        ok: false,
        message: "El tipo de material no es válido.",
      });
    }

    const existing = await MaterialCombustible.findOne({
      codigo: payload.codigo,
    });

    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un material combustible con ese código.",
      });
    }

    const created = await MaterialCombustible.create(payload);

    return res.status(201).json({
      ok: true,
      message: "Material combustible creado correctamente.",
      material: mapMaterial(created),
    });
  } catch (error) {
    console.error("Error creando material combustible:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo crear el material combustible.",
      error: error.message,
    });
  }
};

export const actualizarMaterialCombustible = async (req, res) => {
  try {
    const materialDb = await findMaterialByIdentifier(req.params.id);

    if (!materialDb) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el material combustible.",
      });
    }

    const nextMaterial = req.body.material
      ? normalizeMaterial(req.body.material)
      : materialDb.material;

    const nextName =
      req.body.name !== undefined || req.body.nombre !== undefined
        ? String(req.body.name || req.body.nombre || "").trim()
        : materialDb.name;

    if (!nextName) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del material es obligatorio.",
      });
    }

    const nextCodigo = String(
      req.body.codigo ||
        req.body.id ||
        materialDb.codigo ||
        makeMaterialCode(nextMaterial, nextName)
    )
      .trim()
      .toLowerCase();

    if (nextCodigo !== materialDb.codigo) {
      const existing = await MaterialCombustible.findOne({
        codigo: nextCodigo,
        _id: {
          $ne: materialDb._id,
        },
      });

      if (existing) {
        return res.status(409).json({
          ok: false,
          message: "Ya existe otro material combustible con ese código.",
        });
      }
    }

    materialDb.codigo = nextCodigo;
    materialDb.name = nextName;
    materialDb.material = nextMaterial;

    if (req.body.weightCV !== undefined) {
      materialDb.weightCV = toNumber(req.body.weightCV);
    }

    if (req.body.weightCN !== undefined) {
      materialDb.weightCN = toNumber(req.body.weightCN);
    }

    if (req.body.initialTon !== undefined) {
      materialDb.initialTon = toNumber(req.body.initialTon);
    }

    if (req.body.stockMinimoTon !== undefined) {
      materialDb.stockMinimoTon = toNumber(req.body.stockMinimoTon);
    }

    if (req.body.active !== undefined) {
      materialDb.active = Boolean(req.body.active);
    }

    if (req.body.observacion !== undefined) {
      materialDb.observacion = String(req.body.observacion || "").trim();
    }

    await materialDb.save();

    return res.json({
      ok: true,
      message: "Material combustible actualizado correctamente.",
      material: mapMaterial(materialDb),
    });
  } catch (error) {
    console.error("Error actualizando material combustible:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo actualizar el material combustible.",
      error: error.message,
    });
  }
};

export const cambiarEstadoMaterialCombustible = async (req, res) => {
  try {
    const materialDb = await findMaterialByIdentifier(req.params.id);

    if (!materialDb) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el material combustible.",
      });
    }

    materialDb.active =
      typeof req.body.active === "boolean"
        ? req.body.active
        : !materialDb.active;

    await materialDb.save();

    return res.json({
      ok: true,
      message: materialDb.active
        ? "Material combustible reactivado correctamente."
        : "Material combustible ocultado correctamente.",
      material: mapMaterial(materialDb),
    });
  } catch (error) {
    console.error("Error cambiando estado del material combustible:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo cambiar el estado del material combustible.",
      error: error.message,
    });
  }
};

export const eliminarMaterialCombustible = async (req, res) => {
  try {
    const materialDb = await findMaterialByIdentifier(req.params.id);

    if (!materialDb) {
      return res.status(404).json({
        ok: false,
        message: "No se encontró el material combustible.",
      });
    }

    // Borrado lógico para no romper históricos.
    materialDb.active = false;

    await materialDb.save();

    return res.json({
      ok: true,
      message: "Material combustible ocultado correctamente.",
      material: mapMaterial(materialDb),
    });
  } catch (error) {
    console.error("Error eliminando material combustible:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo eliminar el material combustible.",
      error: error.message,
    });
  }
};