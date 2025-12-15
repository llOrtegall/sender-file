# Cloudflare R2 API

API Node.js + TypeScript para interactuar con Cloudflare R2

## Requisitos

- Node.js 18+
- npm o yarn
- Cuenta Cloudflare con R2 habilitado
- Token de acceso R2

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
# Cloudflare R2
R2_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET_NAME=tu_bucket_name
R2_ENDPOINT=https://tu_account_id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://tu_dominio_publico_o_custom_domain
R2_OBJECTS_PUBLIC=false # true si sirves objetos públicamente desde R2
URL_EXPIRY_SECONDS=300 # expiración de URLs firmadas (segundos)

# API
PORT=3000
NODE_ENV=development
```

## Obtener credenciales R2

1. Ve a https://dash.cloudflare.com/
2. Selecciona tu cuenta
3. R2 > Manage R2 API tokens
4. Crea un nuevo token con permisos de lectura/escritura
5. Copia las credenciales al `.env`

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Endpoints

### Subida directa (URL firmada)
```
POST /api/files/upload-url
Content-Type: application/json

Body:
- fileName: nombre con extensión (ej: video.mp4)
- contentType: MIME (ej: video/mp4)
- expectedSize: (opcional) tamaño esperado para validar límite

Respuesta:
{
  "success": true,
  "uploadUrl": "https://...",  // PUT directo a R2
  "key": "1734100000000-video.mp4",
  "publicUrl": "https://cdn.example.com/1734100000000-video.mp4",
  "expiresIn": 300
}

Cliente (ejemplo fetch):
await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": contentType },
  body: archivoBlob
});
```

### Descarga directa (URL firmada o pública)
```
GET /api/files/download-url/:fileName

Respuesta:
{
  "success": true,
  "downloadUrl": "https://...", // GET directo a R2 o publicUrl
  "key": "1734100000000-video.mp4",
  "expiresIn": 300
}

Cliente: redirige o realiza GET a downloadUrl
```

### Subir archivo
```
POST /api/files/upload
Content-Type: multipart/form-data

Body:
- file: (archivo binario)
- fileName: (opcional - nombre personalizado)

Respuesta:
{
  "success": true,
  "fileUrl": "https://...",
  "fileName": "archivo.mp3",
  "size": 1024
}
```

### Descargar archivo
```
GET /api/files/download/:fileName

Respuesta: archivo binario
```

### Listar archivos
```
GET /api/files/list

Respuesta:
{
  "success": true,
  "files": [
    {
      "key": "archivo.mp3",
      "size": 1024,
      "lastModified": "2024-12-13T..."
    }
  ]
}
```

### Eliminar archivo
```
DELETE /api/files/:fileName

Respuesta:
{
  "success": true,
  "message": "Archivo eliminado"
}
```

## Tipos MIME soportados

- Audio: mp3, wav, flac, aac, ogg
- Documentos: docx, pdf, txt, xlsx, csv
- Bases de datos: sql, sqlite, db
- Otros: json, xml, zip

## Estructura del proyecto

```
src/
├── config/
│   └── r2.ts           # Configuración de R2
├── controllers/
│   └── fileController.ts
├── routes/
│   └── fileRoutes.ts
├── services/
│   └── r2Service.ts    # Lógica de R2
├── types/
│   └── index.ts
└── index.ts            # Entry point
```
