import { View, Text, TouchableOpacity, PanResponder } from 'react-native'

interface ProgressBarProps {
	progress: number
	currentTime: number
	duration: number
	onSeek: (value: number) => void
}

export function ProgressBar({ progress, currentTime, duration, onSeek }: ProgressBarProps) {
	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000)
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60
		return `${minutes}:${String(seconds).padStart(2, '0')}`
	}

	const panResponder = PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderGrant: () => {},
		onPanResponderMove: (_, gesture) => {
			const width = 300 // approximate width
			const seekPercent = Math.max(0, Math.min(1, (gesture.dx + width / 2) / width))
			onSeek(seekPercent)
		},
		onPanResponderRelease: () => {},
	})

	return (
		<View className="w-full px-4">
			<View className="flex-row justify-between mb-1">
				<Text className="text-xs text-text-secondary">{formatTime(currentTime)}</Text>
				<Text className="text-xs text-text-secondary">{formatTime(duration)}</Text>
			</View>
			<View
				{...panResponder.panHandlers}
				className="h-2 bg-surface rounded-full overflow-hidden relative"
			>
				<View
					className="h-2 bg-primary rounded-full absolute top-0 left-0"
					style={{ width: `${progress * 100}%` }}
				/>
				<View
					className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 bg-primary rounded-full"
					style={{ marginRight: -2, left: `${progress * 100}%` }}
				/>
			</View>
		</View>
	)
}