import { useState } from 'react'
import { Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAddMusicToPlaylist, useCreatePlaylist, useRemoveMusicFromPlaylist } from './hooks/mutations/use-playlist-mutations'
import { useMusics, useSearchMusics } from './hooks/queries/use-musics'
import { usePlaylists } from './hooks/queries/use-playlists'
import { usePlayer } from './hooks/use-player'
import { usePlayerQueue } from './hooks/use-player-queue'
import { usePlaylistPicker } from './hooks/use-playlist-picker'
import { useRecentSearches } from './hooks/use-recent-searches'
import { type Playlist } from './infra/api/music-api'
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
	const [searchQuery, setSearchQuery] = useState('')
	const [newPlaylistName, setNewPlaylistName] = useState('')
	const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null)
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

	const player = usePlayer()
	const { data: musics = [], isLoading: musicsLoading, error: musicsError, refetch: refetchMusics, isRefetching: musicsRefetching } = useMusics()
	const { data: playlists, isLoading: playlistsLoading } = usePlaylists()
	const searchResults = useSearchMusics(searchQuery)
	const createPlaylist = useCreatePlaylist()
	const addMusicToPlaylist = useAddMusicToPlaylist()
	const removeMusicFromPlaylist = useRemoveMusicFromPlaylist()
	const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches()

	const { selectedMusic, selectAndPlay, goNext, goPrev, progress, handleSeek, albumGroups } = usePlayerQueue({ player, musics, selectedPlaylistMusicIds: selectedPlaylist?.musicIds })
	const { addingMusicId, handleAddToPlaylist, handleSelectPlaylist, handleClose } = usePlaylistPicker({ addMusicToPlaylist })

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<PlayerScreen selectedMusic={selectedMusic} player={player} progress={progress} handleSeek={handleSeek} goNext={goNext} goPrev={goPrev} onAddToPlaylist={handleAddToPlaylist} />
				)}
				{screen === 'Search' && (
					<SearchScreen searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} onSelectMusic={selectAndPlay} onAddToPlaylist={handleAddToPlaylist} recentSearches={recentSearches} onAddRecentSearch={addRecentSearch} onClearRecentSearches={clearRecentSearches} />
				)}
				{screen === 'Biblioteca' && (
					<BibliotecaScreen musicList={musics} albumGroups={albumGroups} musicsError={musicsError} musicsLoading={musicsLoading} musicsRefetching={musicsRefetching} refetchMusics={refetchMusics} expandedAlbum={expandedAlbum} setExpandedAlbum={setExpandedAlbum} onSelectMusic={selectAndPlay} onAddToPlaylist={handleAddToPlaylist} />
				)}
				{screen === 'Playlists' && (
					<PlaylistsScreen playlists={playlists} playlistsLoading={playlistsLoading} selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} newPlaylistName={newPlaylistName} setNewPlaylistName={setNewPlaylistName} createPlaylist={createPlaylist} removeMusicFromPlaylist={removeMusicFromPlaylist} musicList={musics} onSelectMusic={selectAndPlay} />
				)}
				{screen === 'Equalizer' && (
					<View className="flex-1"><Equalizer /></View>
				)}

				<BottomNav screen={screen} setScreen={setScreen} />

				{addingMusicId !== null && (
					<Modal visible transparent animationType="slide" onRequestClose={handleClose}>
						<PlaylistPickerModal visible playlists={playlists || []} onSelect={handleSelectPlaylist} onClose={handleClose} />
					</Modal>
				)}
			</View>
		</SafeAreaView>
	)
}
