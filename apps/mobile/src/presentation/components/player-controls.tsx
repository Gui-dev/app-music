import { Text, TouchableOpacity, View } from 'react-native'

interface PlayerControlsProps {
	isPlaying: boolean
	onPlay: () => void
	onPause: () => void
	onPrevious?: () => void
	onNext?: () => void
}

export function PlayerControls({
	isPlaying,
	onPlay,
	onPause,
	onPrevious,
	onNext,
}: PlayerControlsProps) {
	return (
		<View className="flex-row items-center justify-center gap-6">
			{onPrevious != null && (
				<TouchableOpacity onPress={onPrevious}>
					<Text className="text-2xl text-text-primary">⏮</Text>
				</TouchableOpacity>
			)}

			<TouchableOpacity
				onPress={isPlaying ? onPause : onPlay}
				className="h-16 w-16 items-center justify-center rounded-full bg-primary"
			>
				<Text className="text-3xl text-bg">
					{isPlaying ? '⏸' : '▶'}
				</Text>
			</TouchableOpacity>

			{onNext != null && (
				<TouchableOpacity onPress={onNext}>
					<Text className="text-2xl text-text-primary">⏭</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}
