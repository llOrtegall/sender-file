export interface FileData {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: Date;
}

export interface FileDatabase {
  [id: string]: FileData;
}
