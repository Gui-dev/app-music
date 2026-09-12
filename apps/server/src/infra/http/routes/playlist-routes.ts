import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function playlistRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/playlists',
		{
			schema: {
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							musicIds: z.array(z.string()),
							createdAt: z.string(),
							updatedAt: z.string(),
						}),
					),
				},
			},
		},
		async () => {
			const playlists = await app.container.listPlaylists.execute()
			return playlists.map((p) => ({
				...p,
				createdAt: p.createdAt.toISOString(),
				updatedAt: p.updatedAt.toISOString(),
			}))
		},
	)

	server.post(
		'/playlists',
		{
			schema: {
				body: z.object({
					name: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { name } = request.body as { name: string }

			try {
				const playlist = await app.container.createPlaylist.execute({ name })
				reply.code(201)
				return {
					...playlist,
					createdAt: playlist.createdAt.toISOString(),
					updatedAt: playlist.updatedAt.toISOString(),
				}
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
				params: z.object({
					id: z.string(),
				}),
				body: z.object({
					musicId: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string }
			const { musicId } = request.body as { musicId: string }

			try {
				await app.container.addMusicToPlaylist.execute({
					playlistId: id,
					musicId,
				})
				return { success: true }
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
				params: z.object({
					id: z.string(),
					musicId: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { id, musicId } = request.params as { id: string; musicId: string }

			try {
				await app.container.removeMusicFromPlaylist.execute({
					playlistId: id,
					musicId,
				})
				return { success: true }
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
