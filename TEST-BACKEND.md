# 🧪 Verificar Backend - Paso a Paso

## ⚠️ Error Actual

```
Error al procesar el video. No se pudo obtener el video de TikTok
```

Esto significa que el backend no está respondiendo o no está desplegado.

## 🔍 Verificación Paso a Paso

### Paso 1: Verificar si el Backend está Desplegado

**Abre en el navegador:**
```
https://ahatok-api.onrender.com/
```

**Si ves:**
```json
{
  "status": "ok",
  "message": "AhaTok API está funcionando"
}
```
✅ **Backend está funcionando**

**Si ves:**
- Error 404
- Página no encontrada
- Timeout
❌ **Backend NO está desplegado o la URL es incorrecta**

### Paso 2: Si el Backend NO está Desplegado

Necesitas desplegarlo en Render:

1. **Ve a:** https://dashboard.render.com/
2. **Click en:** "New +" > "Web Service"
3. **Conecta tu repositorio:** `Ahatok-final`
4. **Configuración:**
   - **Name:** `ahatok-api` (o el que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free
5. **Click en:** "Create Web Service"
6. **Espera** a que termine el deploy (2-5 minutos)

### Paso 3: Probar el Endpoint

Una vez desplegado, prueba:

**En el navegador:**
```
https://TU-API.onrender.com/api/fetch
```

**Con Postman o curl:**
```powershell
curl -X POST https://TU-API.onrender.com/api/fetch -H "Content-Type: application/json" -d "{\"url\":\"https://www.tiktok.com/@user/video/123\"}"
```

### Paso 4: Actualizar URL en Frontend

Si la URL de Render es diferente, actualiza `app.js` línea 79:

```javascript
: 'https://TU-URL-REAL.onrender.com/api/fetch';
```

Luego:
```powershell
git add app.js
git commit -m "Actualizar URL del backend"
git push
```

Vercel desplegará automáticamente la nueva versión.

---

## ✅ Checklist Final

- [ ] Backend desplegado en Render
- [ ] Health check funciona (`/`)
- [ ] Endpoint `/api/fetch` responde
- [ ] URL correcta en `app.js`
- [ ] Frontend actualizado en Vercel
- [ ] Probar descarga de video

---

**¿Tienes el backend desplegado en Render? Si no, necesitamos desplegarlo primero.** 🚀

