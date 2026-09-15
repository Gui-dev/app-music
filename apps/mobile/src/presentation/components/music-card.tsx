import { Text, TouchableOpacity, View } from 'react-native'
import { CoverArt } from './cover-art'

interface Music {
	id: string
	title: string
	artist: string
	album: string
	duration: number | null
	coverUrl: string | null
}

interface MusicCardProps {
	music: Music
	onPress: () => void
	showDuration?: boolean
}

export function MusicCard({
	music,
	onPress,
	showDuration = false,
}: MusicCardProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="mx-4 mb-2 flex-row items-center rounded-lg bg-surface p-3"
		>
			<CoverArt coverUrl={music.coverUrl} size={48} className="mr-3" />
			<View className="flex-1">
				<Text className="text-base font-semibold text-text-primary">
					{music.title}
				</Text>
				<Text className="text-sm text-text-secondary">{music.artist}</Text>
			</View>
			{showDuration && music.duration != null && (
				<Text className="ml-2 text-xs text-text-secondary">
					{Math.floor(music.duration / 60)}:
					{String(music.duration % 60).padStart(2, '0')}
				</Text>
			)}
		</TouchableOpacity>
	)
}
