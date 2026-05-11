# CHAMPA AGRO

App web (mobile-friendly) para localizar agronomos por zona de trabajo.

## Características

- 📍 Mapa interactivo con Google Maps
- 👤 Registro de perfil (nombre, teléfono, zona, cultivos)
- 🌾 Clustering automático de agronomos
- ⚡ Sincronización en tiempo real con Firebase
- 📱 Totalmente responsive para celular

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore + Auth)
- **Mapas**: Google Maps API
- **Deploy**: Vercel

## Requisitos

- Node.js 16+
- npm o yarn
- Firebase Project
- Google Maps API Key

## Setup Local

### 1. Clonar y entrar al repo

```bash
git clone https://github.com/tu-usuario/CHAMPA-AGRO.git
cd CHAMPA-AGRO
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_GOOGLE_MAPS_API_KEY=xxx
# ... resto de variables
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

### 5. Build para producción

```bash
npm run build
```

## Estructura del proyecto

```
src/
├── main.jsx                 # Punto de entrada React
├── App.jsx                  # Componente raíz
├── firebase-config.js       # Config Firebase
├── pages/
│   ├── PaginaMapa.jsx       # Mapa principal
│   ├── PaginaMapa.css
│   ├── PaginaRegistro.jsx   # Formulario
│   └── PaginaRegistro.css
└── index.css                # Estilos globales

public/
└── index.html               # HTML raíz
```

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /agronomos/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
  }
}
```

## Deploy en Vercel

### 1. Pushear a GitHub

```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### 2. Conectar en Vercel

1. Ir a https://vercel.com
2. Click "New Project"
3. Seleccionar repo CHAMPA-AGRO
4. Environment Variables:
   - Agregar todas las variables de `.env.example`
5. Click "Deploy"

**URL:** `https://champa-agro.vercel.app`

## Variables de Entorno

Necesarias:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

## Troubleshooting

### "VITE_GOOGLE_MAPS_API_KEY is undefined"
Verificar que `.env.local` tenga todas las variables y que Vite haya sido reiniciado.

### Mapa no carga
1. Verificar API Key en Google Cloud Console
2. Habilitar "Maps JavaScript API"
3. Verificar restricciones de dominio

### Firebase no conecta
1. Verificar proyecto ID
2. Chequear Firestore Rules
3. Revisar autenticación anónima habilitada

## Licencia

MIT

## Autor

Santi - Agro Neros S.A.
