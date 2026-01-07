# 🎨 Crear Iconos para AhaTok

## 📋 Pasos para Generar los Iconos

### 1. **Abrir el Generador**

Abre el archivo `generar-iconos.html` en tu navegador:
- Haz doble clic en el archivo, o
- Arrastra el archivo a tu navegador

### 2. **Seleccionar el Logo**

1. Haz clic en "Selecciona el Logo"
2. Navega a: `imagenes/Logos/Application logo.png`
3. Selecciona el archivo

### 3. **Generar y Descargar**

Los iconos se generarán automáticamente. Luego:

1. **Favicon (32x32)**: Haz clic en "Descargar favicon.ico"
2. **Icon 192x192**: Haz clic en "Descargar icon-192.png"
3. **Icon 512x512**: Haz clic en "Descargar icon-512.png"

### 4. **Colocar los Iconos**

Coloca los archivos descargados en la raíz del proyecto:
```
BatchTok/
├── favicon.ico
├── icon-192.png
├── icon-512.png
└── ...
```

### 5. **Subir a Git**

```bash
git add favicon.ico icon-192.png icon-512.png
git commit -m "Add: Agregar iconos de la aplicación"
git push
```

## ✅ Verificación

Después de subir los iconos:

1. Recarga la página en Vercel
2. Verifica que el favicon aparezca en la pestaña del navegador
3. Verifica que no haya errores 404 en la consola

## 📝 Notas

- Los iconos se generan con fondo blanco
- El logo se escala manteniendo sus proporciones
- Se agrega un padding del 10% alrededor del logo
- Los iconos son compatibles con PWA

