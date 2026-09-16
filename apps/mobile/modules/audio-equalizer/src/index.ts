import { Platform } from 'react-native'
import type { EqualizerPreset } from './types'

let NativeModule: any = null

if (Platform.OS === 'android') {
	try {
		NativeModule = require('./AudioEqualizerModule').default
	} catch {
		// Module not available (e.g. in Expo Go)
	}
}

export function isAvailable(): boolean {
	return NativeModule != null
}

export function setEnabled(enabled: boolean): void {
	NativeModule?.setEnabled(enabled)
}

export function isEnabled(): boolean {
	return NativeModule?.isEnabled() ?? false
}

export function setBandLevel(band: number, level: number): void {
	NativeModule?.setBandLevel(band, level)
}

export function getBandLevel(band: number): number {
	return NativeModule?.getBandLevel(band) ?? 0
}

export function getNumberOfBands(): number {
	return NativeModule?.getNumberOfBands() ?? 0
}

export function getBandFreqRange(band: number): [number, number] {
	return NativeModule?.getBandFreqRange(band) ?? [0, 0]
}

export function setPreset(presetName: string): void {
	NativeModule?.setPreset(presetName)
}

export function getAvailablePresets(): EqualizerPreset[] {
	const names: string[] = NativeModule?.getPresetNames() ?? []
	return names.map((name) => ({ name }))
}

export function getMinBandLevel(): number {
	return NativeModule?.getMinBandLevel() ?? -1500
}

export function getMaxBandLevel(): number {
	return NativeModule?.getMaxBandLevel() ?? 1500
}
