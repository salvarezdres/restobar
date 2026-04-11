# Menu Creator

Aplicacion para gestionar la carta digital de un restaurante.

## Desarrollo local

```bash
npm run dev
```

## Configuracion del cliente

Las credenciales web viven en `.env.local`.

Archivos principales:

- `src/lib/firebase.ts`
- `src/lib/auth.ts`
- `src/lib/dishes.ts`
- `src/lib/firestore.ts`
- `src/components/google-auth-card.tsx`
- `src/components/dashboard-shell.tsx`

## Acceso

Para que el inicio de sesion funcione, habilita el proveedor de acceso configurado en tu consola:

1. Sign-in method
2. Activa el proveedor correspondiente
3. Define un correo de soporte del proyecto

El acceso usa ventana emergente, asi que el dominio del proyecto o `localhost` debe estar autorizado.

## Menu

El dashboard lee y crea documentos en la coleccion `dishes`.

Cada platillo guarda:

- `name`
- `description`
- `createdAt`
- `createdBy`

## Deploy con GitHub Actions

El workflow corre cuando hay commits en la rama `master`.

Antes de hacer push, crea estos valores en GitHub en `Settings > Secrets and variables > Actions`.
Puedes usar `Repository variables` o `Secrets`, pero deben existir con estos nombres:

```bash
FIREBASE_TOKEN
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Puedes obtener el token con la CLI correspondiente:

```bash
firebase login:ci
```

Las variables `NEXT_PUBLIC_FIREBASE_*` deben copiar la configuracion web del proyecto para que GitHub Actions pueda compilar el sitio y para que el frontend exportado funcione bien en produccion.

Archivos relevantes para deploy:

- `.github/workflows/deploy.yml`
- `firebase.json`
- `.firebaserc`
