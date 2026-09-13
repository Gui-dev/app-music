import { useState } from 'react'
import { Text, TextInput, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMusics, useSearchMusics } from './hooks/queries/use-musics'
import { usePlaylists } from './hooks/queries/use-playlists'
import { useCreatePlaylist, useAddMusicToPlaylist, useRemoveMusicFromPlaylist } from './hooks/mutations/use-playlist-mutations'
import { MusicCard } from './presentation/components/music-card'
import { PlayerControls } from './presentation/components/player-controls'
import { ProgressBar } from './presentation/components/progress-bar'
import { Equalizer } from './presentation/components/equalizer'
import { BottomNav } from './presentation/components/bottom-nav'
import { musicApi, type Music, type Playlist } from './infra/api/music-api'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer'

export function AppContent() {
	const [screen, setScreen] = useState<Screen>('Player')
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [newPlaylistName, setNewPlaylistName] = useState('')

	const { data: musics = [], isLoading: musicsLoading, error: musicsError } = useMusics()
	const { data: playlists, isLoading: playlistsLoading } = usePlaylists()
	const searchResults = useSearchMusics(searchQuery)

	const createPlaylist = useCreatePlaylist()
	const addMusicToPlaylist = useAddMusicToPlaylist()
	const removeMusicFromPlaylist = useRemoveMusicFromPlaylist()

	// Mock duration for demo
	const selectedDuration = selectedMusic?.duration ? selectedMusic.duration * 1000 : 180000

	const handleSeek = (value: number) => {
		setProgress(value)
		setCurrentTime(value * selectedDuration)
	}

	const goNext = () => {
		if (!selectedMusic) return
		const musicsList = musics || []
		const index = musicsList.findIndex((m) => m.id === selectedMusic.id)
		const next = musicsList[(index + 1) % musicsList.length]
		setSelectedMusic(next)
		setIsPlaying(true)
		setProgress(0)
		setCurrentTime(0)
	}

	const goPrev = () => {
		if (!selectedMusic) return
		const musicsList = musics || []
		const index = musicsList.findIndex((m) => m.id === selectedMusic.id)
		const prev = musicsList[(index - 1 + musicsList.length) % musicsList.length]
		setSelectedMusic(prev)
		setIsPlaying(true)
		setProgress(0)
		setCurrentTime(0)
	}

	// Group music by album
	const groupByAlbum = (songs: Music[]) => {
		const albums = songs.reduce((acc, song) => {
			const albumKey = song.album || 'Unknown Album'
			if (!acc[albumKey]) {
				acc[albumKey] = []
			}
			acc[albumKey].push(song)
			return acc
		}, {} as Record<string, Music[]>)
		return Object.entries(albums).sort(([a], [b]) => a.localeCompare(b))
	}

	// Use API data directly, no mock fallback
	const musicList = musics || []
	const searchList = searchResults.data || []
	const albumGroups = groupByAlbum(musicList)

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<View className="flex-1 items-center justify-center p-6">
						{selectedMusic ? (
							<View className="w-full max-w-md items-center">
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Ionicons name="musical-notes" size={64} color="#FACC16" />
								</View>
								<Text className="text-xl font-bold text-text-primary text-center mb-1">{selectedMusic.title}</Text>
								<Text className="text-base text-text-secondary text-center mb-0.5">{selectedMusic.artist}</Text>
								<Text className="text-sm text-text-secondary text-center mb-6">{selectedMusic.album}</Text>

								<ProgressBar
									progress={progress}
									currentTime={currentTime}
									duration={selectedDuration}
									onSeek={(value) => handleSeek(value)}
								/>

								<PlayerControls
									isPlaying={isPlaying}
									onPlay={() => setIsPlaying(true)}
									onPause={() => setIsPlaying(false)}
									onPrev={goPrev}
									onNext={goNext}
								/>
							</View>
						) : (
							<View className="items-center">
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Ionicons name="musical-notes" size={64} color="#FACC16" />
								</View>
								<Text className="text-xl font-bold text-text-primary">No music selected</Text>
								<Text className="mt-1 text-base text-text-secondary">Select a song from Biblioteca</Text>
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
								renderItem={({ item }) => (
									<MusicCard
										music={item}
										onPress={() => {
											setSelectedMusic(item)
											setScreen('Player')
										}}
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
								<Text className="text-2xl font-bold text-text-primary">Biblioteca</Text>
								<Text className="text-sm text-text-secondary">{musicList.length} faixas • {albumGroups.length} álbuns</Text>
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
								renderItem={({ item }) => {
									const [albumName, songs] = item
									return (
										<View className="mx-4 mb-6">
											<Text className="text-xl font-bold text-text-primary mb-3">{albumName}</Text>
											<FlatList
												data={songs}
												keyExtractor={(item) => item.id}
												renderItem={({ item }) => (
													<MusicCard
														music={item}
														onPress={() => {
															setSelectedMusic(item)
															setScreen('Player')
														}}
														showDuration
													/>
												)}
												ListHeaderComponentStyle={{ paddingBottom: 0 }}
											/>
										</View>
									)
								}}
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
			</View>
		</SafeAreaView>
	)
}