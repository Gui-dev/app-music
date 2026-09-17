import { ListMusics } from '@/domain/usecases/music/list-musics'
import { ScanMusicLibrary } from '@/domain/usecases/music/scan-music-library'
import { SearchMusics } from '@/domain/usecases/music/search-musics'
import { StreamMusic } from '@/domain/usecases/music/stream-music'
import { AddMusicToPlaylist } from '@/domain/usecases/playlist/add-music-to-playlist'
import { CreatePlaylist } from '@/domain/usecases/playlist/create-playlist'
import { ListPlaylists } from '@/domain/usecases/playlist/list-playlists'
import { RemoveMusicFromPlaylist } from '@/domain/usecases/playlist/remove-music-from-playlist'
import { type AppDatabase, createDatabase } from '../database/database'
import { CoverCacheRepository } from '../repositories/cover-cache-repository'
import { MusicRepository } from '../repositories/music-repository'
import { PlaylistRepository } from '../repositories/playlist-repository'
import { CoverService } from '../services/cover-service'
import { LocalFileStorage } from '../services/local-file-storage'
import { ScannerService } from '../services/scanner-service'

export interface Container {
	db: AppDatabase
	musicRepository: MusicRepository
	playlistRepository: PlaylistRepository
	coverCacheRepository: CoverCacheRepository
	fileStorage: LocalFileStorage
	coverService: CoverService
	scannerService: ScannerService
	listMusics: ListMusics
	streamMusic: StreamMusic
	searchMusics: SearchMusics
	scanMusicLibrary: ScanMusicLibrary
	createPlaylist: CreatePlaylist
	listPlaylists: ListPlaylists
	addMusicToPlaylist: AddMusicToPlaylist
	removeMusicFromPlaylist: RemoveMusicFromPlaylist
}

export function createContainer(): Container {
	const db = createDatabase()

	const musicRepository = new MusicRepository(db)
	const playlistRepository = new PlaylistRepository(db)
	const coverCacheRepository = new CoverCacheRepository(db)
	const fileStorage = new LocalFileStorage(process.env.MUSIC_PATH || '/music')
	const coverService = new CoverService(
		process.env.LASTFM_API_KEY || '',
		coverCacheRepository,
	)
	const scannerService = new ScannerService()

	const listMusics = new ListMusics(musicRepository)
	const streamMusic = new StreamMusic(musicRepository, fileStorage)
	const searchMusics = new SearchMusics(musicRepository)
	const scanMusicLibrary = new ScanMusicLibrary(scannerService, musicRepository)
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
		coverCacheRepository,
		fileStorage,
		coverService,
		scannerService,
		listMusics,
		streamMusic,
		searchMusics,
		scanMusicLibrary,
		createPlaylist,
		listPlaylists,
		addMusicToPlaylist,
		removeMusicFromPlaylist,
	}
}
