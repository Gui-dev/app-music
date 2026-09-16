import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	useAddMusicToPlaylist,
	useCreatePlaylist,
	useRemoveMusicFromPlaylist,
} from './hooks/mutations/use-playlist-mutations'
import { useMusics, useSearchMusics } from './hooks/queries/use-musics'
import { usePlaylists } from './hooks/queries/use-playlists'
import { usePlayer } from './hooks/use-player'
import { type Music, type Playlist } from './infra/api/music-api'
import { BottomNav } from './presentation/components/bottom-nav'
import { Equalizer } from './presentation/components/equalizer'
import { BibliotecaScreen } from './screens/biblioteca-screen'
import { PlayerScreen } from './screens/player-screen'
import { PlaylistPickerModal } from './screens/playlist-picker-modal'
import { PlaylistsScreen } from './screens/playlists-screen'
import { SearchScreen } from './screens/search-screen'

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

	const musicList = musics || []

	const progress =
		player.durationMillis > 0
			? player.positionMillis / player.durationMillis
			: 0

	const activePlaylistMusics = selectedPlaylist
		? musicList.filter((m) => selectedPlaylist.musicIds.includes(m.id))
		: undefined

	const handleSeek = useCallback(
		(value: number) => {
			const positionMillis = value * player.durationMillis
			player.seek(positionMillis)
		},
		[player],
	)

	const goNext = useCallback(() => {
		if (!selectedMusic) return
		const list = activePlaylistMusics?.length ? activePlaylistMusics : musics || []
		const index = list.findIndex((m) => m.id === selectedMusic.id)
		const next = list[(index + 1) % list.length]
		selectAndPlay(next)
	}, [selectedMusic, activePlaylistMusics, musics, selectAndPlay])

	const goPrev = useCallback(() => {
		if (!selectedMusic) return
		const list = activePlaylistMusics?.length ? activePlaylistMusics : musics || []
		const index = list.findIndex((m) => m.id === selectedMusic.id)
		const prev =
			list[(index - 1 + list.length) % list.length]
		selectAndPlay(prev)
	}, [selectedMusic, activePlaylistMusics, musics, selectAndPlay])

	useEffect(() => {
		player.setOnFinished(goNext)
	}, [player, goNext])

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

	const searchList = searchResults.data || []
	const albumGroups = groupByAlbum(musicList)

	useEffect(() => {
		player.setPlaylist(activePlaylistMusics)
	}, [activePlaylistMusics, player])

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<PlayerScreen
						selectedMusic={selectedMusic}
						player={player}
						progress={progress}
						handleSeek={handleSeek}
						goNext={goNext}
						goPrev={goPrev}
						onAddToPlaylist={(id) => setAddingMusicId(id)}
					/>
				)}

				{screen === 'Search' && (
					<SearchScreen
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						searchResults={searchResults}
						onSelectMusic={selectAndPlay}
						onAddToPlaylist={(id) => setAddingMusicId(id)}
					/>
				)}

				{screen === 'Biblioteca' && (
					<BibliotecaScreen
						musicList={musicList}
						albumGroups={albumGroups}
						musicsLoading={musicsLoading}
						musicsRefetching={musicsRefetching}
						refetchMusics={refetchMusics}
						expandedAlbum={expandedAlbum}
						setExpandedAlbum={setExpandedAlbum}
						onSelectMusic={selectAndPlay}
						onAddToPlaylist={(id) => setAddingMusicId(id)}
					/>
				)}

				{screen === 'Playlists' && (
					<PlaylistsScreen
						playlists={playlists}
						playlistsLoading={playlistsLoading}
						selectedPlaylist={selectedPlaylist}
						setSelectedPlaylist={setSelectedPlaylist}
						newPlaylistName={newPlaylistName}
						setNewPlaylistName={setNewPlaylistName}
						createPlaylist={createPlaylist}
						removeMusicFromPlaylist={removeMusicFromPlaylist}
						musicList={musicList}
						onSelectMusic={selectAndPlay}
					/>
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
						<PlaylistPickerModal
							visible
							playlists={playlists || []}
							onSelect={(playlistId) => {
								addMusicToPlaylist.mutate(
									{ playlistId, musicId: addingMusicId },
									{ onSuccess: () => setAddingMusicId(null) },
								)
							}}
							onClose={() => setAddingMusicId(null)}
						/>
					</Modal>
				)}
			</View>
		</SafeAreaView>
	)
}
