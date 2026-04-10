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
