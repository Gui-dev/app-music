import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
	AddMusicToPlaylistBodySchema,
	CreatePlaylistSchema,
	IdParamSchema,
	PlaylistSchema,
	RemoveMusicFromPlaylistParamsSchema,
} from '../../../schemas'

export async function playlistRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/playlists',
		{
			schema: {
				response: {
					200: z.array(PlaylistSchema),
				},
			},
		},
		async () => {
			return app.container.playlistController.list()
		},
	)

	server.post(
		'/playlists',
		{
			schema: {
				body: CreatePlaylistSchema,
			},
		},
		async (request, reply) => {
			const { name } = request.body as { name: string }
			const playlist = await app.container.playlistController.create(name)
			reply.code(201)
			return playlist
		},
	)

	server.post(
		'/playlists/:id/add',
		{
			schema: {
				params: IdParamSchema,
				body: AddMusicToPlaylistBodySchema,
			},
		},
		async (request) => {
			const { id } = request.params as { id: string }
			const { musicId } = request.body as { musicId: string }
			return app.container.playlistController.addMusic(id, musicId)
		},
	)

	server.delete(
		'/playlists/:id/remove/:musicId',
		{
			schema: {
				params: RemoveMusicFromPlaylistParamsSchema,
			},
		},
		async (request) => {
			const { id, musicId } = request.params as { id: string; musicId: string }
			return app.container.playlistController.removeMusic(id, musicId)
		},
	)
}
