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
