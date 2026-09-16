import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as Equalizer from '../../modules/audio-equalizer/src'

export interface EqualizerState {
	isSupported: boolean
	enabled: boolean
	bands: number[]
	preset: string
	presets: string[]
}

const BAND_LABELS = ['Graves (Bass)', 'Médios (Mid)', 'Agudos (Treble)']

export function useEqualizer() {
	const isSupported = Platform.OS === 'android' && Equalizer.isAvailable()

	const [enabled, setEnabledState] = useState(false)
	const [bands, setBands] = useState<number[]>([0, 0, 0])
	const [preset, setPresetState] = useState('Flat')
	const [presets, setPresets] = useState<string[]>([])

	useEffect(() => {
		if (!isSupported) return

		const count = Equalizer.getNumberOfBands()
		const levels: number[] = []
		for (let i = 0; i < count; i++) {
			levels.push(Equalizer.getBandLevel(i))
		}
		setBands(levels)

		const availablePresets = Equalizer.getAvailablePresets().map((p) => p.name)
		setPresets(availablePresets)
	}, [isSupported])

	const toggle = useCallback(() => {
		if (!isSupported) return
		const next = !enabled
		Equalizer.setEnabled(next)
		setEnabledState(next)
	}, [isSupported, enabled])

	const setBandLevel = useCallback(
		(band: number, level: number) => {
			if (!isSupported) return
			Equalizer.setBandLevel(band, level)
			setBands((prev) => {
				const next = [...prev]
				next[band] = level
				return next
			})
			setPresetState('Custom')
		},
		[isSupported],
	)

	const applyPreset = useCallback(
		(presetName: string) => {
			if (!isSupported) return
			Equalizer.setPreset(presetName)
			setPresetState(presetName)

			const count = Equalizer.getNumberOfBands()
			const levels: number[] = []
			for (let i = 0; i < count; i++) {
				levels.push(Equalizer.getBandLevel(i))
			}
			setBands(levels)
		},
		[isSupported],
	)

	const bandLabels = BAND_LABELS.slice(0, bands.length)

	return {
		isSupported,
		enabled,
		bands,
		bandLabels,
		preset,
		presets,
		toggle,
		setBandLevel,
		applyPreset,
	}
}
