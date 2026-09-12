import { Text, TouchableOpacity, View } from 'react-native'
import type { Music } from '../../infra/api/music-api'

interface MusicCardProps {
	music: Music
	onPress: (music: Music) => void
}

export function MusicCard({ music, onPress }: MusicCardProps) {
	return (
		<TouchableOpacity
			onPress={() => onPress(music)}
			className="mb-2 flex-row items-center rounded-lg bg-surface p-3"
		>
			<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-surface-hover">
				<Text className="text-xl text-primary">♪</Text>
			</View>

			<View className="flex-1">
				<Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
					{music.title}
				</Text>
				<Text className="mt-0.5 text-sm text-text-secondary" numberOfLines={1}>
					{music.artist} — {music.album}
				</Text>
			</View>

			{music.duration != null && (
				<Text className="ml-2 text-xs text-text-secondary">
					{Math.floor(music.duration / 60)}:
					{String(Math.floor(music.duration % 60)).padStart(2, '0')}
				</Text>
			)}
		</TouchableOpacity>
	)
}
