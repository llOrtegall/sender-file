import { randomBytes } from "crypto";

/**
 * Genera un ID corto alfanumérico único
 * @param length Longitud del ID (por defecto 8 caracteres)
 * @returns ID corto aleatorio
 */
export function generateShortId(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}
