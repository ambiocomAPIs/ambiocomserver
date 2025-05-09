import { mongoose } from 'mongoose';
import { URI } from '../keys/key.js';
import dns from 'dns';
import bcrypt from 'bcrypt';
import moment from 'moment';
import Data from '../models/dataModels.js';
import DataColors from '../models/dataColorsModels.js';

const LOCAL_URI = 'mongodb://localhost:27017/ambiocom';

const checkInternetConnection = async () => {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!err); // true si hay internet
    });
  });
};

const db = (async () => {
  try {
    const hasInternet = await checkInternetConnection();
    const selectedURI = hasInternet ? URI : LOCAL_URI;

    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("Conectado a la base de datos");

    const count = await Data.countDocuments();

    if (count === 0) {
      const defaultData = [
        {
          nombre: 'Inhibidor Torre 2428',
          ValorUnitario: 45000,
          Inventario: 310,
          unidad: 'L',
          ConsumoMensual: 0,
          GastoMensual: 0,
          proveedor: 'proveedor Ejemplo',
          lote: 'RQ-20230501',
          tipo: 'Insumo químico',
          area: 'Torre de enfriamiento',
          fechaIngreso: new Date('2026-10-11'),
          fechaVencimiento: new Date('2026-10-11'),
          fechaActualizacionInformacion: new Date('2026-10-11'),
          cantidadIngreso: 0,
          manipulacion: 'Seguridad estándar',
          almacenamiento: 'A temperatura controlada',
          certificadoAnalisis: true,
          responsable: 'Juan Pérez',
          observaciones: 'Producto sin daños',
          SAP: 0,
          ConsumoAcumuladoAnual: 0,
          GastoAcumulado: 0,
          mesesRestantes: 2
        },
        {
          nombre: 'Soda caustica',
          ValorUnitario: 50000,
          Inventario: 80,
          unidad: 'kg',
          ConsumoMensual: 0,
          GastoMensual: 0,
          proveedor: 'proveedor Ejemplo',
          lote: 'CH-20230715',
          tipo: 'Insumo químico',
          area: 'Caldera',
          fechaIngreso: new Date('2026-10-11'),
          fechaVencimiento: new Date('2026-10-11'),
          fechaActualizacionInformacion: new Date('2026-10-11'),
          cantidadIngreso: 0,
          manipulacion: 'Seguridad estándar',
          almacenamiento: 'A temperatura controlada',
          certificadoAnalisis: true,
          responsable: 'Juan Pérez',
          observaciones: 'Producto sin daños',
          SAP: 0,
          ConsumoAcumuladoAnual: 0,
          GastoAcumulado: 0,
          mesesRestantes: 2
        },
        {
          nombre: 'Acido Nitrico',
          ValorUnitario: 120000,
          Inventario: 250,
          unidad: 'L',
          ConsumoMensual: 0,
          GastoMensual: 0,
          proveedor: 'proveedor Ejemplo',
          lote: 'AQ-20231209',
          tipo: 'Insumo químico',
          area: 'Destilacion',
          fechaIngreso: new Date('2026-10-11'),
          fechaVencimiento: new Date('2026-10-11'),
          fechaActualizacionInformacion: new Date('2026-10-11'),
          cantidadIngreso: 0,
          manipulacion: 'Seguridad estándar',
          almacenamiento: 'A temperatura controlada',
          certificadoAnalisis: true,
          responsable: 'Juan Pérez',
          observaciones: 'Producto sin daños',
          SAP: 0,
          ConsumoAcumuladoAnual: 0,
          GastoAcumulado: 0,
          mesesRestantes: 2
        },
        {
          nombre: 'Dietil Ftalato',
          ValorUnitario: 81000,
          Inventario: 100,
          unidad: 'L',
          ConsumoMensual: 0,
          GastoMensual: 0,
          proveedor: 'proveedor Ejemplo',
          lote: 'SX-20230830',
          tipo: 'Insumo químico',
          area: 'Logistica',
          fechaIngreso: new Date('2026-10-11'),
          fechaVencimiento: new Date('2026-10-11'),
          fechaActualizacionInformacion: new Date('2026-10-11'),
          cantidadIngreso: 0,
          manipulacion: 'Seguridad estándar',
          almacenamiento: 'A temperatura controlada',
          certificadoAnalisis: true,
          responsable: 'Juan Pérez',
          observaciones: 'Producto sin daños',
          SAP: 0,
          ConsumoAcumuladoAnual: 0,
          GastoAcumulado: 0,
          mesesRestantes: 2
        },
        {
          nombre: 'Permanganato de Potasio',
          ValorUnitario: 14600,
          Inventario: 4200,
          unidad: 'g',
          ConsumoMensual: 0,
          GastoMensual: 0,
          proveedor: 'Merck',
          lote: 'PQ-20231022',
          tipo: 'Producto químico',
          area: 'Laboratorio',
          fechaIngreso: new Date('2026-10-11'),
          fechaVencimiento: new Date('2026-10-11'),
          fechaActualizacionInformacion: new Date('2026-10-11'),
          cantidadIngreso: 0,
          manipulacion: 'Seguridad estándar',
          almacenamiento: 'A temperatura controlada',
          certificadoAnalisis: true,
          responsable: 'Juan Pérez',
          observaciones: 'Producto sin daños',
          SAP: 0,
          ConsumoAcumuladoAnual: 0,
          GastoAcumulado: 0,
          mesesRestantes: 2
        }
      ];

      await Data.insertMany(defaultData);
      console.log("Se crearon registros por defecto en la colección Data");
    } else {
      console.log("Ya existen registros en la colección Data");
    }

    const countDataColors = await DataColors.countDocuments();

    if (countDataColors === 0) {
      const defaultDataColors = new DataColors({
        Reactivo: '----',
        proveedor: '----',
        Codigo: '----',
        Lote: '----',
        fechaVencimiento: '--/--/--',
        CAS: '----',
        Color: '----',
        Accion: '----'
      });

      await defaultDataColors.save();
      console.log("Se creó un registro por defecto en la colección DataColors");
    } else {
      console.log("Ya existen registros en la colección DataColors");
    }

  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
})();

export default db;
