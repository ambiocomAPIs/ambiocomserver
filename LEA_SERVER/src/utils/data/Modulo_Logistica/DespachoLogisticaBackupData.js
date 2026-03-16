import DespachoAlcoholes from "../../../models/Modulo_Logistica/DespachoAlcoholesLogisticaModels.js";

export const obtenerDespachosParaBackup = async () => {
  return await DespachoAlcoholes.find().lean();
};