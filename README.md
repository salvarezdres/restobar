# Restobar FE

Proyecto Next.js configurado para export estatico, despliegue automatico a Firebase Hosting y consumo de Firestore desde cliente.

## Desarrollo local

```bash
npm run dev
```

## Firebase en cliente

Las credenciales web viven en `.env.local`.

Archivos principales:

- `src/lib/firebase.ts`
- `src/lib/firestore.ts`

## Deploy con Bitbucket Pipelines

El pipeline solo corre cuando hay commits en la rama `master`.

Antes de hacer push, crea esta variable en Bitbucket Repository settings > Pipelines > Repository variables:

```bash
FIREBASE_TOKEN
```

Puedes obtenerla con la CLI de Firebase:

```bash
firebase login:ci
```

Archivos relevantes para deploy:

- `bitbucket-pipelines.yml`
- `firebase.json`
- `.firebaserc`
