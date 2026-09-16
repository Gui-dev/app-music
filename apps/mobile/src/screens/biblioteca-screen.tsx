import { FlatList, RefreshControl, Text, View } from 'react-native'
import { AlbumCard } from '../presentation/components/album-card'
import type { Music } from '../infra/api/music-api'

interface BibliotecaScreenProps {
	musicList: Music[]
	albumGroups: [string, Music[]][]
	musicsLoading: boolean
	musicsRefetching: boolean
	refetchMusics: () => void
	expandedAlbum: string | null
	setExpandedAlbum: (album: string | null) => void
	onSelectMusic: (music: Music) => void
	onAddToPlaylist: (musicId: string) => void
}

export function BibliotecaScreen({
	musicList,
	albumGroups,
	musicsLoading,
	musicsRefetching,
	refetchMusics,
	expandedAlbum,
	setExpandedAlbum,
	onSelectMusic,
	onAddToPlaylist,
}: BibliotecaScreenProps) {
	return (
		<View className="flex-1">
			<View className="p-4">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-bold text-text-primary">
						Biblioteca
					</Text>
					<Text className="text-sm text-text-secondary">
						{musicList.length} faixas • {albumGroups.length} álbuns
					</Text>
				</View>
			</View>
			{musicsLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Loading...</Text>
				</View>
			) : albumGroups.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">No music found</Text>
				</View>
			) : (
				<FlatList
					data={albumGroups}
					keyExtractor={([album]) => album}
					windowSize={5}
					maxToRenderPerBatch={10}
					removeClippedSubviews
					refreshControl={
						<RefreshControl
							refreshing={musicsRefetching}
							onRefresh={refetchMusics}
							tintColor="#FACC16"
							colors={['#FACC16']}
						/>
					}
					renderItem={({ item }) => {
						const [albumName, songs] = item
						const isExpanded = expandedAlbum === albumName
						return (
							<AlbumCard
								albumName={albumName}
								songs={songs}
								isExpanded={isExpanded}
								onToggle={() =>
									setExpandedAlbum(isExpanded ? null : albumName)
								}
								onSongPress={(music) => onSelectMusic(music)}
								onAddToPlaylist={(music) => onAddToPlaylist(music.id)}
							/>
						)
					}}
				/>
			)}
		</View>
	)
}
