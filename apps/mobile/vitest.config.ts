import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const mockDir = resolve(__dirname, '__mocks__')

export default defineConfig({
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'react',
	},
	resolve: {
		alias: {
			'@shared': resolve(__dirname, '../../shared/src'),
			'@': resolve(__dirname, './src'),
			'react-native': resolve(mockDir, 'react-native.js'),
			'react-native-safe-area-context': resolve(
				mockDir,
				'react-native-safe-area-context/index.js',
			),
			'@expo/vector-icons': resolve(mockDir, '@expo/vector-icons.js'),
			nativewind: resolve(mockDir, 'nativewind.js'),
			'react-native-css-interop': resolve(
				mockDir,
				'react-native-css-interop.js',
			),
			'expo-constants': resolve(mockDir, 'expo-constants.js'),
			'expo-audio': resolve(mockDir, 'expo-audio.js'),
			'../../modules/audio-equalizer/src': resolve(mockDir, 'audio-equalizer.js'),
		},
	},
	test: {
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		environment: 'jsdom',
		exclude: ['e2e/**', 'node_modules/**'],
	},
	define: {
		__DEV__: 'true',
	},
})
