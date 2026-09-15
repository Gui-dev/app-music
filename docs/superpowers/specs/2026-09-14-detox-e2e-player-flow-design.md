# Detox E2E Tests — Player Flow Design

## Goal

Write Detox end-to-end tests for the player flow (navigate → select song → play → controls), deferred until Android SDK/emulator is available.

## Context

- `adb` (Android SDK) is not installed on this machine
- Tests will be written and committed but not executed until the environment is set up
- Player flow is the core user journey in the music streaming app

## File Structure

```
apps/mobile/
├── .detoxrc.js              # Detox configuration
├── e2e/
│   ├── jest.config.ts       # Jest config for Detox tests
│   ├── setup.ts             # Global setup (beforeAll/afterAll)
│   └── playerFlow.test.ts   # Player flow E2E test
```

## Detox Configuration (`.detoxrc.js`)

- **Test runner:** Jest
- **Devices:** Android emulator (primary), iOS simulator (optional)
- **Build:** Uses Expo's `eas build` for prebuild, or local `npx expo run:android`
- **App binary:** Points to the built APK/AAB for Android

## Test Flow (`playerFlow.test.ts`)

```
1. beforeAll: Launch app, wait for home screen
2. Tap "Biblioteca" tab (bottom nav)
3. Verify album list renders (expect "Album One" or similar)
4. Tap an album to expand it
5. Verify songs appear in the expanded album
6. Tap a song
7. Verify Player screen shows:
   - Song title text
   - Artist name text
   - Play/pause button exists
   - Progress bar exists
8. Tap play/pause button
9. Verify button state toggles
10. Navigate back to Biblioteca via bottom nav
11. afterAll: Cleanup (device.terminateApp)
```

## Dependencies

- `detox@latest` — E2E testing framework
- `jest` — Test runner (Detox standard)
- `@types/detox` — TypeScript types
- `jest-circus` — Test runner adapter

## Deferred Execution

Tests will be written with correct Detox API usage but cannot be verified until:
1. Android SDK is installed (`adb` available)
2. Android emulator is configured and running
3. App is built for the target device

## Verification (when environment is ready)

```bash
cd apps/mobile
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```
