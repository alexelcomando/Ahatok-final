# 🧪 Probar Endpoint del Backend

## ✅ Backend Funcionando

Tu backend responde correctamente en:
```
https://ahatok-api.onrender.com/
```

## 🧪 Probar el Endpoint de Descarga

### Método 1: Con PowerShell (curl)

```powershell
curl -X POST https://ahatok-api.onrender.com/api/fetch -H "Content-Type: application/json" -d "{\"url\":\"https://www.tiktok.com/@valeng222/video/759024630752\"}"
```

### Método 2: Con Postman

1. Abre Postman
2. Method: **POST**
3. URL: `https://ahatok-api.onrender.com/api/fetch`
4. Headers:
   - Key: `Content-Type`
   - Value: `application/json`
5. Body (raw JSON):
```json
{
  "url": "https://www.tiktok.com/@valeng222/video/759024630752"
}
```
6. Click **Send**

### Método 3: Desde el Navegador (JavaScript Console)

Abre la consola (F12) en cualquier página y pega:

```javascript
fetch('https://ahatok-api.onrender.com/api/fetch', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({url: 'https://www.tiktok.com/@valeng222/video/759024630752'})
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## 📊 Respuesta Esperada

**Si funciona:**
```json
{
  "thumbnail": "https://...",
  "720p": "https://...",
  "1080p": "https://...",
  "audio": "https://...",
  "title": "..."
}
```

**Si falla:**
```json
{
  "error": "Error al procesar el video",
  "message": "..."
}
```

## 🔍 Verificar Logs del Backend

1. Ve a: https://dashboard.render.com/
2. Click en tu servicio `ahatok-api`
3. Ve a la pestaña **"Logs"**
4. Verifica qué errores aparecen cuando haces una petición

---

**Prueba el endpoint y comparte la respuesta que obtienes.** 🧪

