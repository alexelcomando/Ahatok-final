# ⚡ Inicio Rápido - Backend AhaTok

## ✅ Dependencias Instaladas

Si ves:
```
up to date, audited 80 packages in 5s
found 0 vulnerabilities
```

¡Las dependencias ya están instaladas! Puedes continuar.

## 🚀 Ejecutar el Servidor

Ahora ejecuta:

```powershell
node index.js
```

## ✅ Qué Deberías Ver

```
🚀 Servidor AhaTok API activo en el puerto 3000
📍 Endpoint: http://0.0.0.0:3000/api/fetch
✨ Usando Cobalt API y métodos alternativos
```

## 🧪 Probar que Funciona

### Opción 1: En el Navegador
Abre: http://localhost:3000/

Deberías ver:
```json
{
  "status": "ok",
  "message": "AhaTok API está funcionando",
  "endpoint": "/api/fetch",
  "version": "2.0.0",
  "features": ["Cobalt API", "TikTok sin marca de agua", "Instagram", "Facebook"]
}
```

### Opción 2: Con curl (en otra terminal)
```powershell
curl http://localhost:3000/
```

### Opción 3: Probar con un video
```powershell
curl -X POST http://localhost:3000/api/fetch -H "Content-Type: application/json" -d "{\"url\":\"TU_URL_AQUI\"}"
```

## ⚠️ Nota sobre el Error de npm

El mensaje:
```
"CALL "C:\Program Files\nodejs\\node.exe"...
```

Es un warning de npm, pero **NO afecta la funcionalidad**. Las dependencias se instalaron correctamente.

## 🛑 Detener el Servidor

Presiona `Ctrl + C` en la terminal donde está corriendo el servidor.

---

**¡Ejecuta `node index.js` ahora!** 🚀


