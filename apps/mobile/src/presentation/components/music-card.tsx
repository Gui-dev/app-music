import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Music {
	id: string
	title: string
	artist: string
	album: string
	duration: number | null
}

interface MusicCardProps {
	music: Music
	onPress: () => void
	showDuration?: boolean
}

export function MusicCard({ music, onPress, showDuration = false }: MusicCardProps) {
	return (
		<TouchableOpacity onPress={onPress} className="mx-4 mb-2 flex-row items-center rounded-lg bg-surface p-3">
			<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-surface-hover">
				<Ionicons name="musical-notes" size={24} color="#FACC16" />
			</View>
			<View className="flex-1">
				<Text className="text-base font-semibold text-text-primary">{music.title}</Text>
				<Text className="text-sm text-text-secondary">{music.artist}</Text>
			</View>
			{showDuration && music.duration != null && (
				<Text className="ml-2 text-xs text-text-secondary">
					{Math.floor(music.duration / 60)}:{String(music.duration % 60).padStart(2, '0')}
				</Text>
			)}
		</TouchableOpacity>
	)
}