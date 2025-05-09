import Pdf from '../models/pdfModel.js';

export const uploadPdf = async (req, res) => {
    const { rowId } = req.body;

    console.log("rowid recibido:", rowId);
    

    // Verifica que req.file esté definido
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo.' });
    }

    // Extrae las propiedades de req.file
    const { originalname, mimetype, buffer } = req.file;

    // Asegúrate de que originalname se esté utilizando como filename
    if (!originalname) {
        return res.status(400).json({ message: 'El nombre del archivo es requerido.' });
    }

    try {
        const newPdf = new Pdf({
            filename: originalname, // Usa originalname aquí
            data: buffer,
            contentType: mimetype,
            rowId: rowId, // Asegúrate de convertirlo a número
        });

        await newPdf.save();
        res.status(201).json({ message: 'PDF subido exitosamente', filename: originalname });
    } catch (error) {
        console.error("Error al subir el PDF:", error);
        res.status(500).json({ message: 'Error al subir el PDF', error });
    }
};

export const updatePdf = async (req, res) => {
    const { rowId } = req.body;
    const { originalname, mimetype, buffer } = req.file;

    try {
        // Buscar el PDF existente por el rowId
        const existingPdf = await Pdf.findOne({ rowId });

        if (!existingPdf) {
            return res.status(404).json({ message: 'No existe un PDF con este rowId.' });
        }

        // Eliminar el archivo anterior
        await Pdf.findOneAndDelete({ rowId });

        // Crear y guardar el nuevo archivo PDF
        const newPdf = new Pdf({
            filename: originalname,
            data: buffer,
            contentType: mimetype,
            rowId: rowId,
        });

        await newPdf.save();
        res.status(200).json({ message: 'PDF reemplazado exitosamente', filename: originalname });
        
    } catch (error) {
        console.error("Error al actualizar el PDF:", error);
        res.status(500).json({ message: 'Error al actualizar el PDF', error });
    }
};

export const getPdfByIndex = async (req, res) => {
    const { rowId } = req.params;

    try {
        const pdf = await Pdf.findOne({ rowId: rowId });

        if (!pdf) {
            return res.status(404).json({ message: 'PDF no encontrado' });
        }

        // Establecer los encabezados correctos para el tipo de contenido (PDF)
        res.set('Content-Type', pdf.contentType);  // application/pdf
        // Si quieres que se vea en el navegador y no se descargue, NO pongas 'attachment'
        // res.set('Content-Disposition', `attachment; filename="${pdf.filename}"`); // Descomenta esta línea solo si deseas forzar la descarga

        // Enviar el archivo PDF directamente en la respuesta
        res.send(pdf.data);  // Aquí enviamos el buffer directamente
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el PDF', error });
    }
};

export const getDownPdfByIndex = async (req, res) => {
    const { rowId } = req.params;

    try {
        const pdf = await Pdf.findOne({ rowId: rowId });

        if (!pdf) {
            return res.status(404).json({ message: 'PDF no encontrado' });
        }

        console.log("pdf encontrado:", pdf);

        // Asegúrate de que el nombre del archivo se incluya en el encabezado `Content-Disposition`
        res.set('Content-Type', 'application/pdf'); // Establece el tipo de contenido como PDF
        res.set('Content-Disposition', `attachment; filename="${pdf.filename}"`); // Asegúrate de que el nombre del archivo esté incluido

        // Enviar el archivo PDF y el nombre del archivo como un objeto JSON
        res.json({ filename: pdf.filename, data: pdf.data.toString('base64') });  // Convertir el buffer a base64
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el PDF', error });
    }
};



// Eliminar PDF
export const deletePdfByIndex = async (req, res) => {
    const { rowId } = req.params;

    try {
        const deletedPdf = await Pdf.findOneAndDelete({ rowId: rowId });

        if (!deletedPdf) {
            return res.status(404).json({ message: 'PDF no encontrado' });
        }

        res.status(200).json({ message: 'PDF eliminado exitosamente', filename: deletedPdf.filename });
    } catch (error) {
        console.error("Error al eliminar el PDF:", error);
        res.status(500).json({ message: 'Error al eliminar el PDF', error });
    }
};

