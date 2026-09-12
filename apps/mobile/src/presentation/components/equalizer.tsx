import { Text, View } from 'react-native'

interface EqualizerProps {
	bass: number
	mid: number
	treble: number
	onBassChange?: (value: number) => void
	onMidChange?: (value: number) => void
	onTrebleChange?: (value: number) => void
}

function Slider({ label, value }: { label: string; value: number }) {
	return (
		<View className="flex-1 items-center">
			<Text className="mb-2 text-sm text-text-primary">{label}</Text>
			<View className="h-32 w-10 justify-end overflow-hidden rounded-lg bg-surface-hover">
				<View
					className="rounded-lg bg-primary"
					style={{ height: `${value * 100}%` }}
				/>
			</View>
			<Text className="mt-1 text-xs text-text-secondary">
				{Math.round(value * 100)}%
			</Text>
		</View>
	)
}

export function Equalizer({
	bass,
	mid,
	treble,
}: EqualizerProps) {
	return (
		<View className="flex-row justify-around rounded-xl bg-surface p-4">
			<Slider label="Bass" value={bass} />
			<Slider label="Mid" value={mid} />
			<Slider label="Treble" value={treble} />
		</View>
	)
}
