import { View, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PlayerControlsProps {
	isPlaying: boolean
	onPlay: () => void
	onPause: () => void
	onPrev: () => void
	onNext: () => void
	onShuffle?: () => void
	onRepeat?: () => void
	shuffleActive?: boolean
	repeatActive?: boolean
}

export function PlayerControls({
	isPlaying,
	onPlay,
	onPause,
	onPrev,
	onNext,
	onShuffle,
	onRepeat,
	shuffleActive = false,
	repeatActive = false,
}: PlayerControlsProps) {
	return (
		<View className="flex-row items-center justify-center gap-6 py-4">
			<TouchableOpacity onPress={onShuffle} className="p-2" disabled={!onShuffle}>
				<Ionicons
					name={(shuffleActive ? 'shuffle' : 'shuffle-outline') as any}
					size={24}
					color={shuffleActive ? '#FACC16' : '#404047'}
				/>
			</TouchableOpacity>

			<TouchableOpacity onPress={onPrev} className="p-3">
				<Ionicons name="chevron-back-circle" size={32} color="#FFFFFF" />
			</TouchableOpacity>

			<TouchableOpacity onPress={isPlaying ? onPause : onPlay} className="h-16 w-16 items-center justify-center rounded-full bg-primary">
				<Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#0D0D0D" />
			</TouchableOpacity>

			<TouchableOpacity onPress={onNext} className="p-3">
				<Ionicons name="chevron-forward-circle" size={32} color="#FFFFFF" />
			</TouchableOpacity>

			<TouchableOpacity onPress={onRepeat} className="p-2" disabled={!onRepeat}>
				<Ionicons
					name={(repeatActive ? 'repeat' : 'repeat-outline') as any}
					size={24}
					color={repeatActive ? '#FACC16' : '#404047'}
				/>
			</TouchableOpacity>
		</View>
	)
}