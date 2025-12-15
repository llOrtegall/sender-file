export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  size?: number;
  error?: string;
}

export interface ListFilesResponse {
  success: boolean;
  files?: FileInfo[];
  error?: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  url: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DownloadResponse {
  success: boolean;
  data?: Buffer;
  contentType?: string;
  error?: string;
}

export interface UploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  publicUrl?: string;
  expiresIn?: number;
  error?: string;
}

export interface DownloadUrlResponse {
  success: boolean;
  downloadUrl?: string;
  key?: string;
  expiresIn?: number;
  error?: string;
}
