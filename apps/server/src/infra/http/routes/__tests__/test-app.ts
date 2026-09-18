import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import {
	serializerCompiler,
	validatorCompiler,
} from '@fastify/type-provider-zod'
import fastify from 'fastify'
import { AddMusicToPlaylist } from '@/domain/usecases/playlist/add-music-to-playlist'
import { CreatePlaylist } from '@/domain/usecases/playlist/create-playlist'
import { ListPlaylists } from '@/domain/usecases/playlist/list-playlists'
import { RemoveMusicFromPlaylist } from '@/domain/usecases/playlist/remove-music-from-playlist'
import { ListMusics } from '@/domain/usecases/music/list-musics'
import { ScanMusicLibrary } from '@/domain/usecases/music/scan-music-library'
import { SearchMusics } from '@/domain/usecases/music/search-musics'
import { StreamMusic } from '@/domain/usecases/music/stream-music'
import type { Container } from '@/infra/container'
import { MusicController } from '../../controllers/music-controller'
import { PlaylistController } from '../../controllers/playlist-controller'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import { InMemoryPlaylistRepository } from '@/infra/repositories/in-memory/in-memory-playlist-repository'
import { errorHandler } from '../../middleware/error-handler'
import { musicRoutes } from '../music-routes'
import { playlistRoutes } from '../playlist-routes'
import { searchRoutes } from '../search-routes'

export function createTestApp() {
	const app = fastify()

	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	app.setErrorHandler(errorHandler)

	const musicRepository = new InMemoryMusicRepository()
	const playlistRepository = new InMemoryPlaylistRepository()

	const listMusics = new ListMusics(musicRepository)
	const searchMusics = new SearchMusics(musicRepository)
	const createPlaylist = new CreatePlaylist(playlistRepository)
	const listPlaylists = new ListPlaylists(playlistRepository)
	const addMusicToPlaylist = new AddMusicToPlaylist(
		playlistRepository,
		musicRepository,
	)
	const removeMusicFromPlaylist = new RemoveMusicFromPlaylist(playlistRepository)

	const musicController = new MusicController(
		listMusics,
		searchMusics,
		musicRepository,
	)
	const playlistController = new PlaylistController(
		listPlaylists,
		createPlaylist,
		addMusicToPlaylist,
		removeMusicFromPlaylist,
	)

	const container: Container = {
		db: null as any,
		musicRepository: musicRepository as any,
		playlistRepository: playlistRepository as any,
		coverCacheRepository: null as any,
		fileStorage: null as any,
		coverService: null as any,
		scannerService: null as any,
		listMusics,
		searchMusics,
		streamMusic: new StreamMusic(musicRepository, null as any),
		scanMusicLibrary: new ScanMusicLibrary(null as any, musicRepository as any),
		createPlaylist,
		listPlaylists,
		addMusicToPlaylist,
		removeMusicFromPlaylist,
		musicController,
		playlistController,
	}

	app.decorate('container', container)

	app.register(musicRoutes)
	app.register(searchRoutes)
	app.register(playlistRoutes)

	return { app, musicRepository, playlistRepository }
}
