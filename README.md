# Menu Creator

Proyecto Next.js configurado para export estático, despliegue automático a Firebase Hosting y edición de menú desde Firestore.

## Desarrollo local

```bash
npm run dev
```

## Firebase en cliente

Las credenciales web viven en `.env.local`.

Archivos principales:

- `src/lib/firebase.ts`
- `src/lib/auth.ts`
- `src/lib/dishes.ts`
- `src/lib/firestore.ts`
- `src/components/google-auth-card.tsx`
- `src/components/dashboard-shell.tsx`

## Google Sign-In

Para que el login funcione, habilita Google como proveedor en Firebase Console:

1. Authentication > Sign-in method
2. Activa `Google`
3. Define un correo de soporte del proyecto

El frontend usa `signInWithPopup`, asi que el dominio de Firebase Hosting o `localhost` debe estar autorizado en Authentication > Settings > Authorized domains.

## Menú

El dashboard lee y crea documentos en la colección `dishes` de Firestore.

Cada platillo guarda:

- `name`
- `description`
- `createdAt`
- `createdBy`

## Deploy con GitHub Actions

El workflow corre cuando hay commits en la rama `master`.

Antes de hacer push, crea este secreto en GitHub en Settings > Secrets and variables > Actions:

```bash
FIREBASE_TOKEN
```

Puedes obtenerla con la CLI de Firebase:

```bash
firebase login:ci
```

Archivos relevantes para deploy:

- `.github/workflows/deploy.yml`
- `firebase.json`
- `.firebaserc`
