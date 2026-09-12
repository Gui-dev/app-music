import { ListMusics } from '@/domain/usecases/music/list-musics'
import { SearchMusics } from '@/domain/usecases/music/search-musics'
import { StreamMusic } from '@/domain/usecases/music/stream-music'
import { AddMusicToPlaylist } from '@/domain/usecases/playlist/add-music-to-playlist'
import { CreatePlaylist } from '@/domain/usecases/playlist/create-playlist'
import { ListPlaylists } from '@/domain/usecases/playlist/list-playlists'
import { RemoveMusicFromPlaylist } from '@/domain/usecases/playlist/remove-music-from-playlist'
import { type AppDatabase, createDatabase } from '../database/database'
import { MusicRepository } from '../repositories/music-repository'
import { PlaylistRepository } from '../repositories/playlist-repository'
import { CoverService } from '../services/cover-service'
import { LocalFileStorage } from '../services/local-file-storage'
import { ScannerService } from '../services/scanner-service'

export interface Container {
	db: AppDatabase
	musicRepository: MusicRepository
	playlistRepository: PlaylistRepository
	fileStorage: LocalFileStorage
	coverService: CoverService
	scannerService: ScannerService
	listMusics: ListMusics
	streamMusic: StreamMusic
	searchMusics: SearchMusics
	createPlaylist: CreatePlaylist
	listPlaylists: ListPlaylists
	addMusicToPlaylist: AddMusicToPlaylist
	removeMusicFromPlaylist: RemoveMusicFromPlaylist
}

export function createContainer(): Container {
	const db = createDatabase()

	const musicRepository = new MusicRepository(db)
	const playlistRepository = new PlaylistRepository(db)
	const fileStorage = new LocalFileStorage(process.env.MUSIC_PATH || '/music')
	const coverService = new CoverService(process.env.LASTFM_API_KEY || '')
	const scannerService = new ScannerService()

	const listMusics = new ListMusics(musicRepository)
	const streamMusic = new StreamMusic(musicRepository, fileStorage)
	const searchMusics = new SearchMusics(musicRepository)
	const createPlaylist = new CreatePlaylist(playlistRepository)
	const listPlaylists = new ListPlaylists(playlistRepository)
	const addMusicToPlaylist = new AddMusicToPlaylist(
		playlistRepository,
		musicRepository,
	)
	const removeMusicFromPlaylist = new RemoveMusicFromPlaylist(
		playlistRepository,
	)

	return {
		db,
		musicRepository,
		playlistRepository,
		fileStorage,
		coverService,
		scannerService,
		listMusics,
		streamMusic,
		searchMusics,
		createPlaylist,
		listPlaylists,
		addMusicToPlaylist,
		removeMusicFromPlaylist,
	}
}
