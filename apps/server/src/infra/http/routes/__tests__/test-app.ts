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
import { SearchMusics } from '@/domain/usecases/music/search-musics'
import { StreamMusic } from '@/domain/usecases/music/stream-music'
import type { Container } from '@/infra/container'
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

	const container: Container = {
		db: null as any,
		musicRepository: musicRepository as any,
		playlistRepository: playlistRepository as any,
		coverCacheRepository: null as any,
		fileStorage: null as any,
		coverService: null as any,
		scannerService: null as any,
		listMusics: new ListMusics(musicRepository),
		searchMusics: new SearchMusics(musicRepository),
		streamMusic: new StreamMusic(musicRepository, null as any),
		createPlaylist: new CreatePlaylist(playlistRepository),
		listPlaylists: new ListPlaylists(playlistRepository),
		addMusicToPlaylist: new AddMusicToPlaylist(
			playlistRepository,
			musicRepository,
		),
		removeMusicFromPlaylist: new RemoveMusicFromPlaylist(playlistRepository),
	}

	app.decorate('container', container)

	app.register(musicRoutes)
	app.register(searchRoutes)
	app.register(playlistRoutes)

	return { app, musicRepository, playlistRepository }
}
