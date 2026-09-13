import { View, Text, TouchableOpacity } from 'react-native'

interface EqualizerBand {
	label: string
	value: number
	max: number
}

interface EqualizerProps {
	bands?: EqualizerBand[]
	presets?: { label: string; active?: boolean; onPress: () => void }[]
	onBandChange?: (index: number, value: number) => void
}

export function Equalizer({
	bands = [
		{ label: 'Graves (Bass)', value: 4, max: 12 },
		{ label: 'Médios (Mid)', value: 1, max: 12 },
		{ label: 'Agudos (Treble)', value: 3, max: 12 },
	],
	presets = [
		{ label: 'FLAT', active: true, onPress: () => {} },
		{ label: 'BASS BOOST', onPress: () => {} },
		{ label: 'ROCK', onPress: () => {} },
	],
	onBandChange,
}: EqualizerProps) {
	return (
		<View className="p-4">
			<Text className="mb-6 text-2xl font-bold text-text-primary">Equalizador</Text>

			{bands.map((band, index) => (
				<View key={index} className="mb-6">
					<View className="mb-2 flex-row items-center justify-between">
						<Text className="text-text-primary">{band.label}</Text>
						<Text className="text-primary">{band.value > 0 ? '+' : ''}{band.value} dB</Text>
					</View>
					<View className="h-2 rounded-full bg-surface relative">
						<View
							className="h-2 rounded-full bg-primary absolute top-0 left-0"
							style={{ width: `${(band.value / band.max) * 100}%` }}
						/>
					</View>
				</View>
			))}

			<Text className="mb-3 text-base font-semibold text-text-primary">Presets</Text>
			<View className="flex-row gap-3 flex-wrap">
				{presets.map((preset, index) => (
					<TouchableOpacity
						key={index}
						onPress={preset.onPress}
						className={`rounded-lg px-6 py-3 ${preset.active ? 'bg-primary' : 'bg-surface'}`}
					>
						<Text className={preset.active ? 'font-bold text-bg' : 'text-text-primary'}>
							{preset.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	)
}