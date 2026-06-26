# Care For Shweta

Care For Shweta is a local-first React healthcare companion for a caregiver and care receiver. It supports authentication, care connection, daily care tracking, reports, notifications, emergency SOS, settings, an AI-ready assistant, Firebase migration architecture, and PWA offline support.

## Completed Modules

- Module 0: React, Vite, Tailwind, routing, folder structure
- Module 1: Authentication, registration, login, role selection
- Module 2: Multi-user LocalStorage system and dashboard
- Module 3: Care code generation and two-way care connection
- Module 4: Medicine management
- Module 5: Medicine tracking
- Module 6: Reminder system
- Module 7: Meal management
- Module 8: Water intake tracker
- Module 9: Appointment management
- Module 10: Health vitals
- Module 11: Reports and analytics
- Module 12: Notification center
- Module 13: Emergency SOS
- Module 14: Profile and settings
- Module 15: AI health assistant architecture
- Module 16: Firebase migration architecture
- Module 17: Progressive Web App
- Module 18: Production optimization and documentation

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- LocalStorage
- Firebase-ready architecture
- PWA service worker and manifest

## Common Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Data Model

The app is local-first. Collections are stored in LocalStorage using keys from `src/constants/storageKeys.js`. Firebase services mirror the collection abstraction so data can migrate gradually without changing feature panels.

## Safety Note

The AI assistant provides general education and organization support only. Emergency SOS is an in-app alert and does not contact local emergency services.
