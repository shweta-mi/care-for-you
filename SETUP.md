# Setup

## Requirements

- Node.js compatible with the project dependencies
- npm

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the Vite URL printed in the terminal.

## Production Build

```bash
npm run lint
npm run build
```

## Firebase Environment Variables

Firebase is optional. LocalStorage remains the default storage layer.

Add these variables only when Firebase migration is ready:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## AI Integration

The current assistant uses `src/services/aiService.js` as a mock service. For a real OpenAI integration, replace the backend call behind `sendToOpenAIBackend`. Do not expose API keys in the Vite client.

## PWA Testing

Build and preview the production app to test the service worker:

```bash
npm run build
npm run preview
```
