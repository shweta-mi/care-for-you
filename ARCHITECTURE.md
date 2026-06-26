# Architecture

Care For Shweta is organized as a local-first, feature-panel React app. The dashboard owns navigation and care-pair context; feature panels delegate business logic to services and reusable UI components.

## High-Level Diagram

```text
React App
  |
  +-- AppProvider
  |     +-- current user
  |     +-- settings
  |     +-- Firebase runtime status
  |
  +-- Protected Dashboard
        |
        +-- Feature Panels
        |     +-- Medicines
        |     +-- Meals
        |     +-- Water
        |     +-- Appointments
        |     +-- Vitals
        |     +-- Reports
        |     +-- Notifications
        |     +-- Emergency
        |     +-- AI Assistant
        |     +-- Settings
        |
        +-- Services
              +-- LocalStorage repository
              +-- Firebase repository adapter
              +-- Domain services
```

## Data Flow

```text
Component -> Custom Hook -> LocalStorage Service -> Browser LocalStorage
                         -> Repository Adapter -> Firebase Services
```

The UI currently reads and writes through `useStoredCollection`, preserving completed modules. `dataRepository.js` provides a cloud-compatible contract for gradual migration.

## Domain Services

Services hold reusable business rules:

- `medicineService.js`
- `mealService.js`
- `waterService.js`
- `appointmentService.js`
- `vitalsService.js`
- `notificationService.js`
- `emergencyService.js`
- `aiService.js`

## Firebase Architecture

```text
src/firebase/firebaseConfig.js
  |
  +-- services/authService.js
  +-- services/firestoreService.js
  +-- services/storageService.js
```

`src/services/firebaseService.js` remains a compatibility facade for existing app code.

## PWA Architecture

```text
public/manifest.webmanifest
public/sw.js
public/offline.html
src/hooks/useInstallPrompt.js
src/hooks/useOnlineStatus.js
src/components/OfflineBanner.jsx
```

The service worker caches the app shell, supports offline navigation fallback, caches same-origin assets, and includes push-notification event handlers.
