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

			try {
				const playlist = await app.container.playlistController.create(name)
				reply.code(201)
				return playlist
			} catch (error: any) {
				if (error.code === 'DUPLICATE_NAME') {
					return reply.status(409).send({ error: error.message })
				}
				throw error
			}
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
		async (request, reply) => {
			const { id } = request.params as { id: string }
			const { musicId } = request.body as { musicId: string }

			try {
				return await app.container.playlistController.addMusic(id, musicId)
			} catch (error: any) {
				if (error.statusCode === 404) {
					return reply.status(404).send({ error: error.message })
				}
				if (error.code === 'MUSIC_ALREADY_IN_PLAYLIST') {
					return reply.status(409).send({ error: error.message })
				}
				throw error
			}
		},
	)

	server.delete(
		'/playlists/:id/remove/:musicId',
		{
			schema: {
				params: RemoveMusicFromPlaylistParamsSchema,
			},
		},
		async (request, reply) => {
			const { id, musicId } = request.params as { id: string; musicId: string }

			try {
				return await app.container.playlistController.removeMusic(id, musicId)
			} catch (error: any) {
				if (error.statusCode === 404) {
					return reply.status(404).send({ error: error.message })
				}
				if (error.code === 'MUSIC_NOT_IN_PLAYLIST') {
					return reply.status(400).send({ error: error.message })
				}
				throw error
			}
		},
	)
}
