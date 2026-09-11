import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function coverRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/cover/:id',
		{
			schema: {
				params: z.object({
					id: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string }

			const musics = await app.container.listMusics.execute()
			const music = musics.find((m) => m.id === id)

			if (!music) {
				return reply.status(404).send({ error: 'Music not found' })
			}

			if (music.coverUrl) {
				return { coverUrl: music.coverUrl }
			}

			const coverUrl = await app.container.coverService.getCover(
				music.artist,
				music.album,
			)

			return { coverUrl }
		},
	)
}
