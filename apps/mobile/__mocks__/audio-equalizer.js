export function isAvailable() {
	return true
}

export function setEnabled(_enabled) {}
export function isEnabled() {
	return false
}
export function setBandLevel(_band, _level) {}
export function getBandLevel(_band) {
	return 0
}
export function getNumberOfBands() {
	return 3
}
export function getBandFreqRange(_band) {
	return [0, 0]
}
export function setPreset(_presetName) {}
export function getAvailablePresets() {
	return [{ name: 'Flat' }, { name: 'Rock' }, { name: 'Pop' }]
}
export function getMinBandLevel() {
	return -1500
}
export function getMaxBandLevel() {
	return 1500
}
