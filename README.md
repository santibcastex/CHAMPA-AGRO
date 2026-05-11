# CHAMPA AGRO

App móvil para localizar agronomos por zona de trabajo.

## Características

- 📍 Mapa interactivo con ubicaciones de agronomos
- 👤 Registro de perfil (nombre, teléfono, zona, cultivos)
- 🌾 Búsqueda y visualización por zona
- ⚡ Sincronización en tiempo real con Firebase

## Requisitos

- Flutter 3.0+
- Dart 3.0+
- Firebase Project configurado
- Google Maps API Key

## Setup

### 1. Clonar el repo

```bash
git clone https://github.com/tu-usuario/CHAMPA-AGRO.git
cd CHAMPA-AGRO
```

### 2. Instalar dependencias

```bash
flutter pub get
```

### 3. Configurar Firebase

```bash
flutterfire configure
```

Este comando:
- Te pedirá seleccionar el proyecto Firebase
- Generará automáticamente `lib/firebase_options.dart` con tus credenciales

### 4. Configurar Google Maps API

**Android:**
- Ir a `android/app/src/main/AndroidManifest.xml`
- Agregar tu API Key:
```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

**iOS:**
- Ir a `ios/Runner/GeneratedPluginRegistrant.m`
- O configurar en `ios/Runner/Info.plist`

### 5. Ejecutar

```bash
flutter run
```

## Estructura del proyecto

```
lib/
├── main.dart              # Punto de entrada
├── firebase_options.dart  # Config Firebase (auto-generada)
├── pages/
│   ├── mapa_page.dart     # Pantalla principal
│   └── registro_page.dart # Formulario de registro
└── models/                # Modelos de datos (futuro)
```

## Firestore Structure

```
agronomos/
├── {uid}/
│   ├── nombre: string
│   ├── telefono: string
│   ├── zona: string
│   ├── cultivos: array
│   ├── estado: string
│   └── actualizado: timestamp
```

## Zonas disponibles

- Bragado
- Salto
- Chacabuco
- La Plata
- Tandil
- Pergamino
- Tres Arroyos
- Coronel Suárez

## Cultivos disponibles

- Trigo
- Soja
- Maíz
- Girasol
- Cebada
- Avena
- Pastura

## Build & Deploy

### APK (Android)

```bash
flutter build apk --release
```

### Instalar localmente

```bash
flutter install
```

## Troubleshooting

### "flutter: command not found"
```bash
# Agregar Flutter al PATH
export PATH="$PATH:[FLUTTER_SDK]/bin"
```

### Firebase no conecta
- Verificar que `google-services.json` esté en `android/app/`
- Verificar que `GoogleService-Info.plist` esté en `ios/Runner/`

### Google Maps no aparece
- Verificar API Key en AndroidManifest.xml
- Habilitar Maps JavaScript API en Google Cloud Console

## Autor

Santi - Agro Neros S.A.

## Licencia

MIT
