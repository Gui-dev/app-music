export interface EqualizerBand {
	label: string
	frequencyRange: [number, number]
	level: number
}

export interface EqualizerPreset {
	name: string
}
