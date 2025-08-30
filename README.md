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

## Notas
La aplicación actualmente sólo contiene una interfaz básica de bienvenida y muestra la URL de la API configurada en el archivo `.env`.
