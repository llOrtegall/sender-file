import { type Request, type Response } from 'express';
import fileService from '../services/fileService.ts';

const uploadFile = (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const shareLink = fileService.saveFile(req.file);
    res.json(shareLink);
  } catch (err) {
    res.status(500).json({ error: 'Error saving file' });
  }
};

const getFileInfo = (req: Request, res: Response) => {
  const fileId = req.params.id;

  if (!fileId) return res.status(400).json({ error: 'File ID is required' });

  const fileData = fileService.getFileInfo(fileId);
  if (!fileData) return res.status(404).json({ error: 'Archivo no encontrado' });
  res.json(fileData);
};

const downloadFile = (req: Request, res: Response) => {
  const fileId = req.params.id;

  if (!fileId) return res.status(400).send('File ID is required');

  const { fileData, filePath } = fileService.getFileDownloadData(fileId);
  if (!fileData || !filePath) {
    return res.status(404).send('El archivo ya no existe o el enlace expiró.');
  }
  res.download(filePath, fileData.originalName, (err) => {
    if (err) {
      if (!res.headersSent) res.status(404).send('Error al descargar');
    }
  });
};

export default {
  uploadFile,
  getFileInfo,
  downloadFile,
};
