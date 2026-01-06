# 🔧 Solucionar Error de Índice de Firestore

## ⚠️ Error Actual

En la consola ves:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## ✅ Solución Rápida

### Opción 1: Crear el Índice (Recomendado)

1. **Haz clic en el enlace** que aparece en el error de la consola
   - O ve directamente a: https://console.firebase.google.com/project/app-ahatok/firestore/indexes

2. **Firebase te mostrará** el índice que necesita crear
   - Haz clic en **"Create Index"**
   - Espera a que se cree (puede tardar unos minutos)

3. **Recarga la página** de la aplicación

### Opción 2: Crear el Índice Manualmente

1. Ve a Firebase Console: https://console.firebase.google.com/project/app-ahatok/firestore/indexes

2. Haz clic en **"Create Index"**

3. Configura el índice:
   - **Collection ID:** `history`
   - **Fields to index:**
     - Campo 1: `userId` - Ascending
     - Campo 2: `timestamp` - Descending
   - Haz clic en **"Create"**

4. Espera a que el índice se cree (puede tardar 1-5 minutos)

5. Recarga la aplicación

## ✅ Verificar que Funciona

Después de crear el índice:

1. **Recarga la página** (F5)
2. **Abre el historial** desde el menú lateral
3. **No deberías ver** el error del índice en la consola

## 📝 Nota

El código ya tiene un **fallback** que carga el historial sin ordenar si el índice no existe, pero es mejor crear el índice para tener el historial ordenado correctamente.

---

**Una vez creado el índice, el historial funcionará perfectamente.** ✅

