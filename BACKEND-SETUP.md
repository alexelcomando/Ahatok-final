# 🔧 Configuración del Backend para Render

## ✅ Verificación de Requisitos

### 1. ✅ Puerto Dinámico (PORT)
**Estado:** ✅ **CORRECTO**
- El archivo `backend/index.js` usa `process.env.PORT || 3000`
- Escucha en `0.0.0.0` (requerido por Render)
- ✅ **NO NECESITAS CAMBIAR NADA**

### 2. ✅ package.json
**Estado:** ✅ **CORRECTO**
- ✅ Tiene `"start": "node index.js"`
- ✅ Incluye `express`, `cors`, `axios`
- ✅ Configurado para Node.js 18+
- ✅ **NO NECESITAS CAMBIAR NADA**

### 3. ⚠️ Estructura de Respuesta
**Estado:** ⚠️ **NECESITA IMPLEMENTACIÓN**
- La estructura está definida correctamente
- **PERO** la lógica de scraping está como placeholder
- **DEBES** implementar la lógica real para obtener los videos

---

## 📋 Checklist para Render

### ✅ Ya Tienes:
- [x] Puerto dinámico (`process.env.PORT`)
- [x] Escucha en `0.0.0.0`
- [x] `package.json` con `start` script
- [x] Dependencias: `express`, `cors`, `axios`
- [x] Estructura de respuesta correcta
- [x] CORS habilitado

### ⚠️ Falta Implementar:
- [ ] Lógica real de scraping (línea ~40 en `backend/index.js`)
- [ ] Procesar URLs de TikTok
- [ ] Procesar URLs de Instagram
- [ ] Procesar URLs de Facebook

---

## 🚀 Pasos para Desplegar en Render

### Paso 1: Subir Backend a GitHub

```bash
# Asegúrate de estar en la raíz del proyecto
git add backend/
git commit -m "Add: Backend API para Render"
git push
```

### Paso 2: Crear Servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** > **"Web Service"**
3. Conecta tu repositorio: `Ahatok-final`
4. Configuración:
   - **Name:** `ahatok-api` (o el que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (o el que prefieras)

### Paso 3: Verificar Despliegue

1. Render te dará una URL como: `https://ahatok-api.onrender.com`
2. Prueba el health check: `https://ahatok-api.onrender.com/`
3. Debe responder: `{ "status": "ok", ... }`

### Paso 4: Actualizar URL en Frontend

En `app.js` línea 75, actualiza:

```javascript
const response = await fetch('https://TU-API.onrender.com/api/fetch', {
```

---

## 🔧 Implementar Lógica de Scraping

### Opción 1: Usar yt-dlp (Python) - RECOMENDADO

Crea `backend/scraper.py`:
```python
import subprocess
import json
import sys

url = sys.argv[1]
result = subprocess.run(['yt-dlp', '--dump-json', url], 
                        capture_output=True, text=True)
data = json.loads(result.stdout)

print(json.dumps({
    "thumbnail": data.get('thumbnail', ''),
    "720p": data.get('url', ''),
    "1080p": data.get('url', ''),
    "audio": data.get('url', ''),
    "title": data.get('title', '')
}))
```

En `index.js`:
```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// En el endpoint /api/fetch:
const { stdout } = await execAsync(`python3 scraper.py "${url}"`);
const response = JSON.parse(stdout);
res.json(response);
```

### Opción 2: Usar Librerías Node.js

```bash
cd backend
npm install tiktok-scraper instagram-scraper
```

Luego implementa en `index.js` según la documentación de cada librería.

---

## ⚠️ Notas Importantes

1. **Render Free Tier:**
   - El servidor puede "dormirse" después de 15 min de inactividad
   - La primera petición puede tardar ~30 segundos en "despertar"
   - Tu frontend ya tiene timeout de 30 segundos configurado ✅

2. **CORS:**
   - Ya está configurado para permitir cualquier origen
   - Si quieres restringir, cambia en `index.js`:
   ```javascript
   app.use(cors({
       origin: 'https://tu-dominio.com'
   }));
   ```

3. **Estructura de Respuesta:**
   - **DEBE** incluir: `thumbnail`, `720p`, `1080p`, `audio`, `title`
   - Si alguna calidad no está disponible, usa `null` o string vacío
   - El frontend maneja estos casos

---

## ✅ Resumen

**Ya tienes:**
- ✅ Configuración correcta para Render
- ✅ Estructura de respuesta correcta
- ✅ CORS y Express configurados

**Falta:**
- ⚠️ Implementar lógica real de scraping
- ⚠️ Probar el endpoint
- ⚠️ Desplegar en Render

¡El backend está listo para desplegar! Solo falta implementar la lógica de scraping. 🚀

