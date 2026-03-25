import RecepcionAlcoholes from "../../../models/Modulo_Logistica/RecepcionAlcoholesLogisticaModels.js";

export const obtenerRecepcionParaBackup = async () => {
  return await RecepcionAlcoholes.find().lean();
};