import { type FileDatabase, type FileData } from '../types/file';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';

// In-memory database
const fileDatabase: FileDatabase = {};

const saveFile = (file: Express.Multer.File): string => {
  const fileId = uuidv4().split('-')[0];

  if (fileId !== undefined) {
    fileDatabase[fileId] = {
      id: fileId,
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      uploadDate: new Date(),
    };
    return `http://localhost:5173/download/${fileId}`;
  }

  throw new Error('Error generating file ID');
};

const getFileInfo = (fileId: string): FileData | undefined => {
  return fileDatabase[fileId];
};

const getFileDownloadData = (fileId: string): { fileData?: FileData; filePath?: string } => {
  const fileData = fileDatabase[fileId];
  if (!fileData) return {};
  const filePath = path.join(__dirname, '../../uploads', fileData.filename);
  if (!fs.existsSync(filePath)) return {};
  return { fileData, filePath };
};

export default {
  saveFile,
  getFileInfo,
  getFileDownloadData,
};
