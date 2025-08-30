# Baggie App

Aplicación móvil creada con [Expo](https://expo.dev/) y React Native usando TypeScript.

## Requisitos
- Node.js 18+
- npm 9+
- Expo CLI (se instala automáticamente con `npm start`)

## Instalación
```bash
npm install
```

## Variables de entorno
Crea un archivo `.env` en la raíz con las variables necesarias:
```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

## Ejecutar la aplicación
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Vistas incluidas
La aplicación contiene:
- Pantalla de inicio con navegación hacia listas y creación de viaje.
- Listado de viajes de ejemplo.
- Detalle de un viaje con elementos marcables.
- Flujo de creación con selección de destino y tipo de alojamiento.

## Notas
Por ahora sólo se manejan datos de ejemplo y no existe integración con backend.
## Notas
La aplicación actualmente sólo contiene una interfaz básica de bienvenida y muestra la URL de la API configurada en el archivo `.env`.

