# ⚡ Despliegue Rápido - Frontend AhaTok

## 🎯 Opción Más Rápida: Vercel (5 minutos)

### Paso 1: Actualizar URL del Backend

Edita `app.js` línea 81 y reemplaza `tu-api.onrender.com` con la URL real de tu backend en Render:

```javascript
const API_URL = isLocalhost 
    ? 'http://localhost:3000/api/fetch'
    : 'https://TU-API-REAL.onrender.com/api/fetch'; // ⚠️ Cambia esto
```

### Paso 2: Subir a GitHub

```powershell
git add .
git commit -m "Preparar para despliegue"
git push
```

### Paso 3: Desplegar en Vercel

1. Ve a: https://vercel.com
2. Sign in con GitHub
3. **"Add New Project"**
4. Selecciona: `Ahatok-final`
5. Configuración:
   - Framework: **Other**
   - Root Directory: `.`
   - Build Command: (vacío)
   - Output Directory: `.`
6. Click **"Deploy"**

### Paso 4: ¡Listo!

Tu app estará en: `https://ahatok-final.vercel.app`

---

## 🔥 Opción Recomendada: Firebase Hosting

### Paso 1: Instalar Firebase CLI

```powershell
npm install -g firebase-tools
```

### Paso 2: Login

```powershell
firebase login
```

### Paso 3: Inicializar

```powershell
cd C:\Users\ESTUDIANTE\Desktop\BatchTok
firebase init hosting
```

**Respuestas:**
- Public directory: `.` (Enter)
- Single-page app: **Y**
- Overwrite index.html: **N**

### Paso 4: Desplegar

```powershell
firebase deploy --only hosting
```

### Paso 5: ¡Listo!

Tu app estará en: `https://app-ahatok.web.app`

---

## ⚠️ IMPORTANTE: Actualizar URL del Backend

**Antes de desplegar**, edita `app.js` línea 81:

```javascript
// Reemplaza 'tu-api.onrender.com' con tu URL real de Render
const API_URL = isLocalhost 
    ? 'http://localhost:3000/api/fetch'
    : 'https://TU-API-REAL.onrender.com/api/fetch';
```

---

## ✅ Checklist

- [ ] Backend desplegado en Render (tener la URL)
- [ ] URL del backend actualizada en `app.js` línea 81
- [ ] Código subido a GitHub
- [ ] Desplegado en Vercel/Firebase/Netlify

---

**¿Tienes la URL de tu backend en Render?** Si no, primero despliega el backend. 🚀

