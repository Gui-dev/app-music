import { View, TouchableOpacity, Text, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MusicCard } from './music-card'
import { type Music } from '../../infra/api/music-api'

interface AlbumCardProps {
	albumName: string
	songs: Music[]
	isExpanded: boolean
	onToggle: () => void
	onSongPress: (music: Music) => void
}

export function AlbumCard({ albumName, songs, isExpanded, onToggle, onSongPress }: AlbumCardProps) {
	return (
		<View className="mx-4 mb-4">
			<TouchableOpacity onPress={onToggle} className="mb-3">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-3">
						<View className="h-16 w-16 rounded-lg bg-surface-hover items-center justify-center">
							<Ionicons name="musical-notes" size={32} color="#FACC16" />
						</View>
						<View>
							<Text className="text-lg font-bold text-text-primary">{albumName}</Text>
							<Text className="text-sm text-text-secondary">{songs.length} faixas</Text>
						</View>
					</View>
					<Ionicons
						name={isExpanded ? 'chevron-up' : 'chevron-down'}
						size={24}
						color="#404047"
					/>
				</View>
			</TouchableOpacity>

			{isExpanded && (
				<FlatList
					data={songs}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<MusicCard
							music={item}
							onPress={() => onSongPress(item)}
							showDuration
						/>
					)}
				/>
			)}
		</View>
	)
}