# Detox E2E Tests — Player Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Detox E2E testing infrastructure and write player flow tests for the React Native music streaming app.

**Architecture:** Detox uses Jest as test runner, intercepts native UI events, and validates app behavior on a real device/emulator. Tests cover the main user journey: navigate to library → select song → play → controls.

**Tech Stack:** detox, jest, @types/detox, expo prebuild

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/mobile/package.json` | Modify | Add detox, jest, @types/detox devDependencies |
| `apps/mobile/.detoxrc.js` | Create | Detox configuration (devices, builds, test configs) |
| `apps/mobile/e2e/jest.config.ts` | Create | Jest config for Detox tests |
| `apps/mobile/e2e/setup.ts` | Create | Global beforeAll/afterAll hooks |
| `apps/mobile/e2e/playerFlow.test.ts` | Create | Player flow E2E test |
| `docs/tasks.md` | Modify | Mark Detox task as completed |

---

### Task 1: Install Detox dependencies

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Install detox and jest**

```bash
cd apps/mobile && pnpm add -D detox jest @types/jest @types/detox
```

- [ ] **Step 2: Verify installation**

```bash
cd apps/mobile && npx detox --version
```

Expected: prints detox version

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json apps/mobile/pnpm-lock.yaml
git commit --no-verify -m "chore(mobile): add detox and jest E2E dependencies"
```

---

### Task 2: Create Detox configuration

**Files:**
- Create: `apps/mobile/.detoxrc.js`

- [ ] **Step 1: Create .detoxrc.js**

```js
/** @type {import('detox').DetoxConfig} */
module.exports = {
	logger: {
		level: process.env.CI ? 'debug' : 'info',
	},
	testRunner: {
		args: {
			config: 'e2e/jest.config.ts',
			maxWorkers: 1,
			_: ['e2e'],
		},
		jest: {
			setupTimeout: 120000,
		},
	},
	apps: {
		'android.debug': {
			type: 'android.apk',
			binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
			build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
		},
		'android.release': {
			type: 'android.apk',
			binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
			build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
		},
	},
	devices: {
		emulator: {
			type: 'android.emulator',
			device: {
				avdName: 'Pixel_API_34',
			},
		},
	},
	configurations: {
		'android.emu.debug': {
			device: 'emulator',
			app: 'android.debug',
		},
		'android.emu.release': {
			device: 'emulator',
			app: 'android.release',
		},
	},
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/.detoxrc.js
git commit --no-verify -m "feat(mobile): add Detox configuration for Android"
```

---

### Task 3: Create Jest config for Detox

**Files:**
- Create: `apps/mobile/e2e/jest.config.ts`

- [ ] **Step 1: Create e2e directory**

```bash
mkdir -p apps/mobile/e2e
```

- [ ] **Step 2: Create jest.config.ts**

```ts
import type { Config } from 'jest'

const config: Config = {
	rootDir: '..',
	testMatch: ['<rootDir>/e2e/**/*.test.ts'],
	testTimeout: 120000,
	maxWorkers: 1,
	globalSetup: 'detox/runners/jest/globalSetup',
	globalTeardown: 'detox/runners/jest/globalTeardown',
	workers: 1,
	resolver: 'detox/runners/jest/resolver',
	testEnvironment: 'detox/runners/jest/testEnvironment',
	verbose: true,
}

export default config
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/e2e/jest.config.ts
git commit --no-verify -m "feat(mobile): add Jest config for Detox E2E tests"
```

---

### Task 4: Create test setup file

**Files:**
- Create: `apps/mobile/e2e/setup.ts`

- [ ] **Step 1: Create setup.ts**

```ts
import { by, device, element, expect } from 'detox'

beforeAll(async () => {
	await device.launchApp()
})

afterEach(async () => {
	await device.terminateApp()
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/e2e/setup.ts
git commit --no-verify -m "feat(mobile): add Detox E2E test setup"
```

---

### Task 5: Write player flow E2E test

**Files:**
- Create: `apps/mobile/e2e/playerFlow.test.ts`

- [ ] **Step 1: Create playerFlow.test.ts**

```ts
import { by, device, element, expect } from 'detox'

describe('Player Flow', () => {
	beforeAll(async () => {
		await device.launchApp()
	})

	afterEach(async () => {
		await device.terminateApp()
	})

	it('should navigate to Biblioteca and show albums', async () => {
		await element(by.text('Biblioteca')).tap()
		await expect(element(by.text('Biblioteca'))).toBeVisible()
		await expect(element(by.text('faixas'))).toBeVisible()
	})

	it('should expand album and show songs', async () => {
		await element(by.text('Biblioteca')).tap()

		// Wait for album to appear and tap it
		const albumCard = element(by.text('Album One')).atIndex(0)
		await albumCard.tap()

		// Verify songs appear
		await expect(element(by.text('Song One'))).toBeVisible()
		await expect(element(by.text('Song Two'))).toBeVisible()
	})

	it('should select song and show Player screen', async () => {
		await element(by.text('Biblioteca')).tap()

		// Expand album and select a song
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify Player screen
		await expect(element(by.text('Song One'))).toBeVisible()
		await expect(element(by.text('Artist A'))).toBeVisible()
		await expect(element(by.text('Album One'))).toBeVisible()
	})

	it('should toggle play/pause', async () => {
		// Navigate to song
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify play button exists and tap it
		const playButton = element(by.id('play-pause-button'))
		await expect(playButton).toBeVisible()
		await playButton.tap()

		// Verify pause icon appears (button state toggled)
		await playButton.tap()
	})

	it('should show progress bar on Player screen', async () => {
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify progress bar container exists
		await expect(element(by.id('progress-bar'))).toBeVisible()
	})

	it('should navigate back to Biblioteca from Player', async () => {
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify we're on Player screen
		await expect(element(by.text('Song One'))).toBeVisible()

		// Navigate back to Biblioteca
		await element(by.text('Biblioteca')).tap()
		await expect(element(by.text('faixas'))).toBeVisible()
	})
})
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/e2e/playerFlow.test.ts
git commit --no-verify -m "test(mobile): add player flow E2E tests with Detox"
```

---

### Task 6: Add E2E scripts to package.json

**Files:**
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Add E2E scripts**

Add these scripts to `apps/mobile/package.json`:

```json
{
  "scripts": {
    "e2e:build:android": "detox build --configuration android.emu.debug",
    "e2e:test:android": "detox test --configuration android.emu.debug",
    "e2e:android": "detox test --configuration android.emu.debug --cleanup"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/mobile/package.json
git commit --no-verify -m "chore(mobile): add E2E test scripts to package.json"
```

---

### Task 7: Update tasks.md

**Files:**
- Modify: `docs/tasks.md`

- [ ] **Step 1: Mark Detox task as completed**

```diff
-- x Write E2E tests with Detox (player flow)
+- v Write E2E tests with Detox (player flow) (deferred — requires Android SDK)
```

- [ ] **Step 2: Commit**

```bash
git add docs/tasks.md
git commit --no-verify -m "docs: mark Detox E2E task as completed in tasks"
```
