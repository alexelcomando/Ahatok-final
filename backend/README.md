# 🚀 Backend API - AhaTok

Backend para procesar videos de TikTok, Instagram y Facebook.

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación Local

```bash
cd backend
npm install
npm start
```

El servidor estará en: `http://localhost:3000`

## 📡 Endpoints

### POST `/api/fetch`

Procesa una URL de video y devuelve los links de descarga.

**Request:**
```json
{
  "url": "https://www.tiktok.com/@user/video/123456"
}
```

**Response:**
```json
{
  "thumbnail": "https://example.com/thumb.jpg",
  "720p": "https://example.com/video_720p.mp4",
  "1080p": "https://example.com/video_1080p.mp4",
  "audio": "https://example.com/audio.mp3",
  "title": "Título del video"
}
```

## 🚀 Desplegar en Render

1. Crea un nuevo **Web Service** en Render
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
4. Render automáticamente usará el `PORT` de entorno

## ⚠️ Importante

- El servidor **DEBE** usar `process.env.PORT` (ya configurado)
- El servidor **DEBE** escuchar en `0.0.0.0` (ya configurado)
- La respuesta **DEBE** tener la estructura exacta mostrada arriba

## 🔧 Implementar Lógica de Scraping

Reemplaza el código en `index.js` (línea ~40) con tu lógica real:

**Opciones:**
- **yt-dlp** (Python) - Más completo
- **ytdl-core** (Node.js) - Para YouTube
- **tiktok-scraper** (Node.js) - Para TikTok
- **instagram-scraper** (Node.js) - Para Instagram

Ejemplo con yt-dlp (Python):
```python
import subprocess
import json

result = subprocess.run(['yt-dlp', '--dump-json', url], 
                        capture_output=True, text=True)
data = json.loads(result.stdout)
```

