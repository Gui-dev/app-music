import { Ionicons } from '@expo/vector-icons'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { CoverArt } from '../presentation/components/cover-art'
import type { Music, Playlist } from '../infra/api/music-api'

interface PlaylistsScreenProps {
	playlists: Playlist[] | undefined
	playlistsLoading: boolean
	selectedPlaylist: Playlist | null
	setSelectedPlaylist: (playlist: Playlist | null) => void
	newPlaylistName: string
	setNewPlaylistName: (name: string) => void
	createPlaylist: { mutate: (name: string, options?: object) => void; isPending: boolean }
	removeMusicFromPlaylist: { mutate: (vars: { playlistId: string; musicId: string }) => void }
	musicList: Music[]
	onSelectMusic: (music: Music) => void
}

export function PlaylistsScreen({
	playlists,
	playlistsLoading,
	selectedPlaylist,
	setSelectedPlaylist,
	newPlaylistName,
	setNewPlaylistName,
	createPlaylist,
	removeMusicFromPlaylist,
	musicList,
	onSelectMusic,
}: PlaylistsScreenProps) {
	if (selectedPlaylist) {
		const songs = selectedPlaylist.musicIds
			.map((id) => musicList.find((m) => m.id === id))
			.filter(Boolean) as Music[]

		return (
			<View className="flex-1">
				<View className="px-4 mb-4">
					<TouchableOpacity
						onPress={() => setSelectedPlaylist(null)}
						className="mb-2"
					>
						<Text className="text-primary">
							← Back to playlists
						</Text>
					</TouchableOpacity>
					<Text className="text-xl font-bold text-text-primary">
						{selectedPlaylist.name}
					</Text>
					<Text className="text-sm text-text-secondary">
						{selectedPlaylist.musicIds.length} songs
					</Text>
				</View>
				<FlatList
					data={songs}
					keyExtractor={(item) => item.id}
					windowSize={5}
					maxToRenderPerBatch={10}
					removeClippedSubviews
					renderItem={({ item }) => (
						<View className="mx-4 mb-2 flex-row items-center rounded-lg bg-surface p-3">
							<TouchableOpacity
								onPress={() => onSelectMusic(item)}
								className="flex-1 flex-row items-center"
							>
								<CoverArt coverUrl={item.coverUrl} size={40} className="mr-3" />
								<View className="flex-1">
									<Text className="text-sm font-semibold text-text-primary">
										{item.title}
									</Text>
									<Text className="text-xs text-text-secondary">
										{item.artist}
									</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() =>
									removeMusicFromPlaylist.mutate({
										playlistId: selectedPlaylist.id,
										musicId: item.id,
									})
								}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								className="ml-2"
							>
								<Ionicons name="trash-outline" size={18} color="#EF4444" />
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={
						<View className="items-center py-8">
							<Text className="text-text-secondary">
								No songs in this playlist
							</Text>
						</View>
					}
				/>
			</View>
		)
	}

	return (
		<View className="flex-1">
			<View className="p-4">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-bold text-text-primary">
						Playlists
					</Text>
					<Text className="text-sm text-text-secondary">
						{playlists?.length || 0} playlists
					</Text>
				</View>
				<View className="flex-row mb-4">
					<TextInput
						className="flex-1 rounded-lg bg-surface px-4 py-3 text-text-primary mr-2"
						placeholder="New playlist name..."
						placeholderTextColor="#404047"
						value={newPlaylistName}
						onChangeText={setNewPlaylistName}
					/>
					<TouchableOpacity
						className="rounded-lg bg-primary px-4 py-3"
						onPress={() => {
							if (newPlaylistName.trim()) {
								createPlaylist.mutate(newPlaylistName.trim(), {
									onSuccess: () => setNewPlaylistName(''),
								})
							}
						}}
						disabled={!newPlaylistName.trim() || createPlaylist.isPending}
					>
						<Text className="font-semibold text-bg">
							{createPlaylist.isPending ? '...' : 'Create'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			{playlistsLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Loading...</Text>
				</View>
			) : !playlists || playlists.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">No playlists yet</Text>
				</View>
			) : (
				<FlatList
					data={playlists}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							className="mx-4 mb-3 rounded-lg bg-surface p-4"
							onPress={() => setSelectedPlaylist(item)}
						>
							<View className="flex-row items-center justify-between">
								<View className="flex-1">
									<Text className="text-base font-semibold text-text-primary">
										{item.name}
									</Text>
									<Text className="mt-1 text-sm text-text-secondary">
										{item.musicIds.length} songs
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color="#404047" />
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	)
}
