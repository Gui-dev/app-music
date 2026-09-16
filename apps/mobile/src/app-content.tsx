import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	FlatList,
	Modal,
	RefreshControl,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	useAddMusicToPlaylist,
	useCreatePlaylist,
	useRemoveMusicFromPlaylist,
} from './hooks/mutations/use-playlist-mutations'
import { useMusics, useSearchMusics } from './hooks/queries/use-musics'
import { usePlaylists } from './hooks/queries/use-playlists'
import { usePlayer } from './hooks/use-player'
import { type Music, musicApi, type Playlist } from './infra/api/music-api'
import { AlbumCard } from './presentation/components/album-card'
import { BottomNav } from './presentation/components/bottom-nav'
import { CoverArt } from './presentation/components/cover-art'
import { Equalizer } from './presentation/components/equalizer'
import { MusicCard } from './presentation/components/music-card'
import { PlayerControls } from './presentation/components/player-controls'
import { ProgressBar } from './presentation/components/progress-bar'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer' | 'Playlists'

export function AppContent() {
	const [screen, setScreen] = useState<Screen>('Player')
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [newPlaylistName, setNewPlaylistName] = useState('')
	const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null)
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
	const [addingMusicId, setAddingMusicId] = useState<string | null>(null)

	const player = usePlayer()
	const lastPlayedIdRef = useRef<string | null>(null)

	const {
		data: musics = [],
		isLoading: musicsLoading,
		error: musicsError,
		refetch: refetchMusics,
		isRefetching: musicsRefetching,
	} = useMusics()
	const { data: playlists, isLoading: playlistsLoading } = usePlaylists()
	const searchResults = useSearchMusics(searchQuery)

	const createPlaylist = useCreatePlaylist()
	const addMusicToPlaylist = useAddMusicToPlaylist()
	const removeMusicFromPlaylist = useRemoveMusicFromPlaylist()

	const selectAndPlay = useCallback(
		(music: Music) => {
			setSelectedMusic(music)
			setScreen('Player')
			lastPlayedIdRef.current = music.id
			player.loadAndPlay(music)
		},
		[player],
	)

	const progress =
		player.durationMillis > 0
			? player.positionMillis / player.durationMillis
			: 0

	const handleSeek = useCallback(
		(value: number) => {
			const positionMillis = value * player.durationMillis
			player.seek(positionMillis)
		},
		[player],
	)

	const goNext = useCallback(() => {
		if (!selectedMusic) return
		const musicsList = musics || []
		const index = musicsList.findIndex((m) => m.id === selectedMusic.id)
		const next = musicsList[(index + 1) % musicsList.length]
		selectAndPlay(next)
	}, [selectedMusic, musics, selectAndPlay])

	const goPrev = useCallback(() => {
		if (!selectedMusic) return
		const musicsList = musics || []
		const index = musicsList.findIndex((m) => m.id === selectedMusic.id)
		const prev =
			musicsList[(index - 1 + musicsList.length) % musicsList.length]
		selectAndPlay(prev)
	}, [selectedMusic, musics, selectAndPlay])

	useEffect(() => {
		player.setOnFinished(goNext)
	}, [player, goNext])

	// Group music by album
	const groupByAlbum = (songs: Music[]) => {
		const albums = songs.reduce(
			(acc, song) => {
				const albumKey = song.album || 'Unknown Album'
				if (!acc[albumKey]) {
					acc[albumKey] = []
				}
				acc[albumKey].push(song)
				return acc
			},
			{} as Record<string, Music[]>,
		)
		return Object.entries(albums).sort(([a], [b]) => a.localeCompare(b))
	}

	// Use API data directly, no mock fallback
	const musicList = musics || []
	const searchList = searchResults.data || []
	const albumGroups = groupByAlbum(musicList)

	const activePlaylistMusics = selectedPlaylist
		? musicList.filter((m) => selectedPlaylist.musicIds.includes(m.id))
		: undefined

	useEffect(() => {
		player.setPlaylist(activePlaylistMusics)
	}, [activePlaylistMusics, player])

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<View className="flex-1 items-center justify-center p-6">
						{selectedMusic ? (
							<View className="w-full max-w-md items-center">
								<CoverArt
									coverUrl={selectedMusic.coverUrl}
									size={256}
									className="mb-6 rounded-2xl"
								/>
								<Text className="text-xl font-bold text-text-primary text-center mb-1">
									{selectedMusic.title}
								</Text>
								<Text className="text-base text-text-secondary text-center mb-0.5">
									{selectedMusic.artist}
								</Text>
								<Text className="text-sm text-text-secondary text-center mb-6">
									{selectedMusic.album}
								</Text>

							<ProgressBar
								progress={progress}
								currentTime={player.positionMillis}
								duration={player.durationMillis}
								onSeek={handleSeek}
							/>

							<PlayerControls
								isPlaying={player.isPlaying}
								onPlay={() => player.play()}
								onPause={() => player.pause()}
								onPrev={goPrev}
								onNext={goNext}
							/>
							</View>
						) : (
							<View className="items-center">
								<CoverArt
									coverUrl={null}
									size={256}
									className="mb-6 rounded-2xl"
								/>
								<Text className="text-xl font-bold text-text-primary">
									No music selected
								</Text>
								<Text className="mt-1 text-base text-text-secondary">
									Select a song from Biblioteca
								</Text>
							</View>
						)}
					</View>
				)}

				{screen === 'Search' && (
					<View className="flex-1">
						<View className="p-4">
							<TextInput
								className="rounded-lg bg-surface px-4 py-3 text-text-primary"
								placeholder="Search music..."
								placeholderTextColor="#404047"
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
						</View>
						{searchResults.isLoading ? (
							<View className="flex-1 items-center justify-center">
								<Text className="text-text-secondary">Searching...</Text>
							</View>
						) : (
							<FlatList
								data={searchResults.data || []}
								keyExtractor={(item) => item.id}
								windowSize={5}
								maxToRenderPerBatch={10}
								removeClippedSubviews
								renderItem={({ item }) => (
									<MusicCard
										music={item}
										onPress={() => selectAndPlay(item)}
										onAddToPlaylist={() => setAddingMusicId(item.id)}
									/>
								)}
							/>
						)}
					</View>
				)}

				{screen === 'Biblioteca' && (
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
										onSongPress={(music) => selectAndPlay(music)}
										onAddToPlaylist={(music) => setAddingMusicId(music.id)}
										/>
									)
								}}
							/>
						)}
					</View>
				)}

				{screen === 'Playlists' && (
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
					) : selectedPlaylist ? (
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
								data={selectedPlaylist.musicIds
									.map((id) => musicList.find((m) => m.id === id))
									.filter(Boolean)}
								keyExtractor={(item) => item!.id}
								windowSize={5}
								maxToRenderPerBatch={10}
								removeClippedSubviews
								renderItem={({ item }) => (
									<MusicCard
										music={item!}
										onPress={() => selectAndPlay(item!)}
									/>
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
			)}

			{screen === 'Equalizer' && (
					<View className="flex-1">
						<Equalizer />
					</View>
				)}

				<BottomNav screen={screen} setScreen={setScreen} />

			{addingMusicId !== null && (
			<Modal
				visible
				transparent
				animationType="slide"
				onRequestClose={() => setAddingMusicId(null)}
			>
				<View className="flex-1 justify-end bg-black/60">
					<View className="rounded-t-2xl bg-surface p-4">
						<Text className="mb-4 text-lg font-bold text-text-primary">
							Adicionar à playlist
						</Text>
						<FlatList
							data={playlists || []}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<TouchableOpacity
									onPress={() => {
										if (addingMusicId) {
											addMusicToPlaylist.mutate(
												{ playlistId: item.id, musicId: addingMusicId },
												{ onSuccess: () => setAddingMusicId(null) },
											)
										}
									}}
									className="mb-2 rounded-lg bg-surface-hover p-3"
								>
									<Text className="text-base text-text-primary">
										{item.name}
									</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity
							onPress={() => setAddingMusicId(null)}
							className="mt-2 items-center py-3"
						>
							<Text className="text-text-secondary">Cancelar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			)}
		</View>
		</SafeAreaView>
	)
}
