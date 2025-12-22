export interface UploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  shortId?: string;
  publicUrl?: string;
  expiresIn?: number;
  error?: string;
}

export type DownloadUrlResponse = {
  success: boolean;
  downloadUrl?: string;
  key?: string;
  expiresIn?: number;
  error?: string;
  LastModified?: Date | undefined;
};

export interface MultipartInitiateResponse {
  success: boolean;
  uploadId?: string;
  key?: string;
  shortId?: string;
  partSize?: number;
  expiresIn?: number;
  error?: string;
}

export interface MultipartPartUrlResponse {
  success: boolean;
  uploadUrl?: string;
  key?: string;
  partNumber?: number;
  expiresIn?: number;
  error?: string;
}

export interface MultipartCompleteResponse {
  success: boolean;
  key?: string;
  error?: string;
}

export interface MultipartAbortResponse {
  success: boolean;
  key?: string;
  error?: string;
}