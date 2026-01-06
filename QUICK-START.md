# ⚡ Inicio Rápido - AhaTok

## 🎯 3 Pasos para que funcione

### 1️⃣ Verificar Firebase (5 minutos)

**Abre:** https://console.firebase.google.com/project/app-ahatok

**Habilita Authentication:**
- Ve a Authentication > Sign-in method
- Activa **Google** (haz clic y guarda)
- Activa **Email/Password** (haz clic y guarda)

**Crea Firestore:**
- Ve a Firestore Database
- Si dice "Crear base de datos", haz clic
- Modo: **Prueba** (para desarrollo)
- Ubicación: elige la más cercana
- Listo ✅

---

### 2️⃣ Crear Iconos (2 minutos)

**Opción A: Usar el generador**
1. Abre `create-icons.html` en tu navegador
2. Los iconos se descargarán automáticamente
3. Muévelos a la carpeta del proyecto

**Opción B: Manual**
1. Ve a https://favicon.io/favicon-generator/
2. Texto: **AT**
3. Color de fondo: **#121212**
4. Color de texto: **#e91e63**
5. Descarga y renombra:
   - `favicon-32x32.png` → `icon-192.png` (redimensiona a 192x192)
   - `android-chrome-512x512.png` → `icon-512.png`

---

### 3️⃣ Backend API

**Si ya tienes API en Render:**
- Verifica que funcione: https://mi-api-ahatok.onrender.com/api/fetch
- Si no funciona, crea uno nuevo

**Si NO tienes backend:**
- Necesitas crear una API que procese videos
- O usar una API pública existente
- Actualiza la URL en `app.js` línea 75

---

## 🚀 Probar Localmente

```bash
node server.js
```

Abre: http://localhost:8000

---

## 🌐 Desplegar en la Web

### Firebase Hosting (Recomendado)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: .
# Single-page app: Yes
firebase deploy
```

**Tu app estará en:** `https://app-ahatok.web.app`

---

## ✅ Checklist Final

- [ ] Firebase Authentication habilitado
- [ ] Firestore Database creado
- [ ] Iconos creados (`icon-192.png` y `icon-512.png`)
- [ ] Backend API funcionando
- [ ] Probado localmente
- [ ] Desplegado en la web

---

## 🆘 ¿Problemas?

**"Firebase no funciona"**
- Verifica que Authentication y Firestore estén habilitados
- Revisa la consola del navegador (F12)

**"No puedo descargar videos"**
- Verifica que el backend API esté funcionando
- Revisa la URL en `app.js` línea 75

**"Los iconos no aparecen"**
- Verifica que los archivos existan en la raíz
- Revisa las rutas en `manifest.json`

---

¡Listo! 🎉

