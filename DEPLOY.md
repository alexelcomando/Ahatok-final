# 🚀 Guía Rápida: Desplegar AhaTok en la Web

## ⚡ Lo Mínimo Necesario (Para que funcione YA)

### 1. ✅ Firebase - Verificar Configuración (5 minutos)

Ya tienes las credenciales configuradas. Solo verifica:

1. Ve a [Firebase Console](https://console.firebase.google.com/project/app-ahatok)
2. **Authentication:**
   - Ve a Authentication > Sign-in method
   - Habilita **Google** y **Email/Password**
3. **Firestore:**
   - Ve a Firestore Database
   - Si no existe, haz clic en "Crear base de datos"
   - Modo: Prueba (para desarrollo)
   - Ubicación: elige la más cercana

### 2. 🔴 Backend API - CRÍTICO

**Tu app necesita una API que procese los videos.**

**Opción A: Si ya tienes backend en Render**
- Verifica que `https://mi-api-ahatok.onrender.com/api/fetch` funcione
- Prueba con Postman o curl:
```bash
curl -X POST https://mi-api-ahatok.onrender.com/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@user/video/123"}'
```

**Opción B: Crear backend rápido (Node.js)**
Crea un archivo `backend/server.js`:
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/fetch', async (req, res) => {
  const { url } = req.body;
  // Aquí tu lógica para obtener el video
  // Usa librerías como yt-dlp, ytdl-core, etc.
  res.json({
    thumbnail: "...",
    "720p": "...",
    "1080p": "...",
    audio: "..."
  });
});

app.listen(3000);
```

**Opción C: Usar API pública temporal**
- Actualiza la URL en `app.js` línea 75
- O crea un proxy

### 3. 🔴 Iconos - FÁCIL (5 minutos)

**Opción Rápida: Generar iconos placeholder**

Puedo crear iconos simples con texto, o puedes:

1. **Usar herramienta online:**
   - Ve a [favicon.io](https://favicon.io/favicon-generator/)
   - Texto: "AT" o "AhaTok"
   - Color: #e91e63 (rosa)
   - Descarga y renombra a `icon-192.png` y `icon-512.png`

2. **O crear manualmente:**
   - Abre cualquier editor (Paint, Photoshop, Canva)
   - Crea imagen 512x512px
   - Fondo: #121212, Texto: "AT" en #e91e63
   - Guarda como `icon-512.png`
   - Redimensiona a 192x192px y guarda como `icon-192.png`

### 4. 🟢 Desplegar en la Web (10 minutos)

#### **Opción 1: Firebase Hosting (RECOMENDADO - GRATIS)**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (en la carpeta del proyecto)
firebase init hosting

# Preguntas:
# - Public directory: . (punto)
# - Single-page app: Yes
# - Overwrite index.html: No

# Desplegar
firebase deploy --only hosting
```

Tu app estará en: `https://app-ahatok.web.app`

#### **Opción 2: Vercel (MUY FÁCIL - GRATIS)**

1. Ve a [vercel.com](https://vercel.com)
2. Sign in con GitHub
3. New Project > Import Git Repository
4. Selecciona `Ahatok-final`
5. Deploy

Tu app estará en: `https://ahatok-final.vercel.app`

#### **Opción 3: Netlify (FÁCIL - GRATIS)**

1. Ve a [netlify.com](https://netlify.com)
2. Sign in con GitHub
3. Add new site > Import from Git
4. Selecciona `Ahatok-final`
5. Build command: (dejar vacío)
6. Publish directory: . (raíz)
7. Deploy

---

## 📋 Checklist Final

Antes de desplegar, verifica:

- [ ] Firebase Authentication habilitado (Google + Email)
- [ ] Firestore Database creado
- [ ] Backend API funcionando
- [ ] Iconos creados (`icon-192.png` y `icon-512.png`)
- [ ] Probado localmente con `node server.js`

---

## 🐛 Problemas Comunes

**"Firebase no inicializado"**
- Verifica que las credenciales en `app.js` sean correctas
- Abre la consola del navegador (F12) para ver errores

**"Error al obtener video"**
- Verifica que el backend API esté funcionando
- Revisa la URL en `app.js` línea 75
- El backend puede tardar en "despertar" (Render free tier)

**"Service Worker no funciona"**
- Solo funciona con HTTPS o localhost
- Asegúrate de desplegar en un servicio con HTTPS

**"Iconos no aparecen"**
- Verifica que los archivos existan
- Revisa las rutas en `manifest.json`
- Los iconos deben estar en la raíz del proyecto

---

## ✅ Una vez desplegado

1. Abre la URL de tu app
2. Prueba el login (Google o Email)
3. Prueba descargar un video
4. Verifica el historial en Firestore

¡Listo! Tu app estará funcionando en la web 🎉

