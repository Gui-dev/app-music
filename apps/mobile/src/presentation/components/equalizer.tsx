import { Ionicons } from '@expo/vector-icons'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useEqualizer } from '../../hooks/use-equalizer'

const MAX_DB = 12
const MIN_DB = -12
const STEP = 1

interface EqualizerProps {
	eq?: ReturnType<typeof useEqualizer>
}

export function Equalizer({ eq }: EqualizerProps) {
	const hook = useEqualizer()
	const { isSupported, enabled, bands, bandLabels, preset, presets, toggle, setBandLevel, applyPreset } = eq ?? hook

	if (!isSupported) {
		return (
			<View className="flex-1 items-center justify-center p-6">
				<Ionicons name="options-outline" size={48} color="#404047" />
									<Text className="mt-4 text-lg text-text-secondary">
						Equalizador não disponível
									</Text>
								<Text className="mt-2 text-sm text-text-secondary text-center">
						Disponível apenas no Android
								</Text>
			</View>
		)
	}

	return (
		<ScrollView className="flex-1 p-4">
			<View className="flex-row items-center justify-between mb-6">
				<Text className="text-2xl font-bold text-text-primary">
					Equalizador
				</Text>
				<TouchableOpacity
					onPress={toggle}
					className={`rounded-full px-4 py-2 ${enabled ? 'bg-primary' : 'bg-surface'}`}
				>
					<Text className={enabled ? 'font-bold text-bg' : 'text-text-secondary'}>
						{enabled ? 'ON' : 'OFF'}
					</Text>
				</TouchableOpacity>
			</View>

			{bands.map((level, index) => (
				<View key={index} className="mb-6">
					<View className="mb-2 flex-row items-center justify-between">
						<Text className="text-text-primary">
							{bandLabels[index] ?? `Band ${index}`}
						</Text>
						<Text className="text-primary font-mono">
							{level > 0 ? '+' : ''}{level} dB
						</Text>
					</View>

					<View className="flex-row items-center gap-3">
						<TouchableOpacity
							onPress={() => setBandLevel(index, Math.max(level - STEP, MIN_DB))}
							disabled={!enabled || level <= MIN_DB}
							className="h-8 w-8 items-center justify-center rounded-full bg-surface"
						>
							<Ionicons name="remove" size={16} color={enabled ? '#FACC16' : '#404047'} />
						</TouchableOpacity>

						<View className="flex-1">
							<View className="h-3 rounded-full bg-surface relative">
								<View
									className="h-3 rounded-full absolute top-0 left-0"
									style={{
										width: `${((level - MIN_DB) / (MAX_DB - MIN_DB)) * 100}%`,
										backgroundColor: enabled ? '#FACC16' : '#404047',
									}}
								/>
							</View>
						</View>

						<TouchableOpacity
							onPress={() => setBandLevel(index, Math.min(level + STEP, MAX_DB))}
							disabled={!enabled || level >= MAX_DB}
							className="h-8 w-8 items-center justify-center rounded-full bg-surface"
						>
							<Ionicons name="add" size={16} color={enabled ? '#FACC16' : '#404047'} />
						</TouchableOpacity>
					</View>
				</View>
			))}

			{presets.length > 0 && (
				<>
					<Text className="mb-3 text-base font-semibold text-text-primary">
						Presets
					</Text>
					<View className="mb-6 flex-row gap-3 flex-wrap">
						{presets.map((name) => (
							<TouchableOpacity
								key={name}
								onPress={() => applyPreset(name)}
								disabled={!enabled}
								className={`rounded-lg px-4 py-3 ${
									preset === name ? 'bg-primary' : 'bg-surface'
								}`}
							>
								<Text
									className={
										preset === name
											? 'font-bold text-bg'
											: enabled
												? 'text-text-primary'
												: 'text-text-secondary'
									}
								>
									{name}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</>
			)}
		</ScrollView>
	)
}
