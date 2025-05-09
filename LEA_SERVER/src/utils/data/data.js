import mongoose from 'mongoose';
import Producto from '../../models/dataModels.js'; // Asegúrate de tener el modelo adecuado para Producto

// Función para obtener productos próximos a vencer
// export const obtenerProductosAProximoVencer = async () => {
//   return [
//     {
//       nombre: "Producto A",
//       lote: "L12345",
//       fechaVencimiento: "2024-12-15",  // Fecha de vencimiento en formato YYYY-MM-DD
//       proveedor: "proveedor X",
//       estado: "próximo a vencer"
//     },
//     {
//       nombre: "Producto B",
//       lote: "L67890",
//       fechaVencimiento: "2024-11-25",
//       proveedor: "proveedor Y",
//       estado: "próximo a vencer"
//     }
//   ];
// }

// Función para obtener productos vencidos
// export const obtenerProductosVencidos = async () => {
//   return [
//     {
//       nombre: "Producto C",
//       lote: "L11111",
//       fechaVencimiento: "2023-06-10",  // Producto vencido
//       proveedor: "proveedor Z",
//       estado: "vencido"
//     }
//   ];
// }


// Función para obtener productos que ya están vencidos
export const obtenerProductosVencidos = async () => {
  try {
    const fechaActual = new Date();
    
    //^ Obtener todos los productos (esto puede ser una operación costosa si tienes muchos productos)
    const productos = await Producto.find();
    
    // Filtrar los productos cuyo fechaVencimiento es menor a la fecha actual
    const productosVencidos = productos.filter(producto => {
      const fechaVencimiento = new Date(producto.fechaVencimiento);
      return fechaVencimiento < fechaActual; // Filtra solo los productos con fecha < fechaActual
    });

     //console.log("Productos vencidos en data:", productosVencidos);
    return productosVencidos;
  } catch (error) {
    console.error('Error al obtener productos vencidos:', error);
    throw error;
  }
};




//^ Función para calcular la diferencia en meses entre dos fechas
const calcularDiferenciaEnMeses = (fechaInicio, fechaFin) => {
  const diferencia = fechaFin.getTime() - fechaInicio.getTime();
  const meses = diferencia / (1000 * 3600 * 24 * 30); // Convertir de milisegundos a meses
  return Math.floor(meses); // Redondear hacia abajo
};

//^ Función para obtener productos próximos a vencer (dentro del rango de "mesesRestantes")
export const obtenerProductosAProximoVencer = async () => {
  try {
    const fechaActual = new Date();
    const productosProximosAVencer = await Producto.find();

    // Filtrar los productos que están próximos a vencer
    const productosFiltrados = productosProximosAVencer.filter((producto) => {
      const fechaVencimiento = new Date(producto.fechaVencimiento); // Asegúrate de que sea un objeto Date
      const mesesRestantes = parseInt(producto.mesesRestantes, 10); // Convertir el valor de mesesRestantes a número
      const mesesDeDiferencia = calcularDiferenciaEnMeses(fechaActual, fechaVencimiento);

      // Solo devolver productos que no estén vencidos y cuya diferencia de meses sea menor o igual a mesesRestantes
      return mesesDeDiferencia >= 0 && mesesDeDiferencia <= mesesRestantes;
    });

    // console.log("productosFiltrados:", productosFiltrados);
    return productosFiltrados;
  } catch (error) {
    console.error('Error al obtener productos próximos a vencer:', error);
    throw error;
  }
};

