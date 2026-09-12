import { Text, TouchableOpacity, View } from 'react-native'

interface ProgressBarProps {
	positionMillis: number
	durationMillis: number
	onSeek: (positionMillis: number) => void
}

function formatTime(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function ProgressBar({
	positionMillis,
	durationMillis,
	onSeek,
}: ProgressBarProps) {
	const progress = durationMillis > 0 ? positionMillis / durationMillis : 0

	return (
		<View className="w-full">
			<TouchableOpacity
				onPress={(e) => {
					const { locationX } = e.nativeEvent
					const width = 300
					const percentage = Math.max(0, Math.min(1, locationX / width))
					onSeek(Math.floor(percentage * durationMillis))
				}}
				className="h-5 w-full justify-center"
			>
				<View className="h-1 overflow-hidden rounded-full bg-surface-hover">
					<View
						className="h-full rounded-full bg-primary"
						style={{ width: `${progress * 100}%` }}
					/>
				</View>
			</TouchableOpacity>

			<View className="mt-1 flex-row justify-between">
				<Text className="text-xs text-text-secondary">
					{formatTime(positionMillis)}
				</Text>
				<Text className="text-xs text-text-secondary">
					{formatTime(durationMillis)}
				</Text>
			</View>
		</View>
	)
}
