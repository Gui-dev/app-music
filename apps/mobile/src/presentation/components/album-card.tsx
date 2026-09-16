import { Ionicons } from '@expo/vector-icons'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import type { Music } from '../../infra/api/music-api'
import { CoverArt } from './cover-art'
import { MusicCard } from './music-card'

interface AlbumCardProps {
	albumName: string
	songs: Music[]
	isExpanded: boolean
	onToggle: () => void
	onSongPress: (music: Music) => void
	onAddToPlaylist?: (music: Music) => void
}

export function AlbumCard({
	albumName,
	songs,
	isExpanded,
	onToggle,
	onSongPress,
	onAddToPlaylist,
}: AlbumCardProps) {
	const albumCoverUrl = songs[0]?.coverUrl ?? null

	return (
		<View className="mx-4 mb-4">
			<TouchableOpacity onPress={onToggle} className="mb-3">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-3">
						<CoverArt coverUrl={albumCoverUrl} size={64} />
						<View>
							<Text className="text-lg font-bold text-text-primary">
								{albumName}
							</Text>
							<Text className="text-sm text-text-secondary">
								{songs.length} faixas
							</Text>
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
								onAddToPlaylist={
									onAddToPlaylist
										? () => onAddToPlaylist(item)
										: undefined
								}
							/>
						)}
					/>
			)}
		</View>
	)
}
