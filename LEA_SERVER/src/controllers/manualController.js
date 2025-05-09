import fs from 'fs';
import path from 'path';

export const downloadManual = (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'pdfFiles', 'manualAPPLABAKC.pdf');

  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    console.error('El archivo no existe en la ruta especificada');
    return res.status(404).send('El archivo no se encuentra disponible.');
  }

  // Establecer los encabezados para forzar la descarga
  res.setHeader('Content-Disposition', 'attachment; filename=manualAPPLABAKC.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  // Intentar enviar el archivo con sendFile
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error al intentar enviar el archivo:', err);
      return res.status(500).send('Error al intentar enviar el archivo.');
    }
  });
};
