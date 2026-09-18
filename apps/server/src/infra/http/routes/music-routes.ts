import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function musicRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/music',
		{
			schema: {
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							title: z.string(),
							artist: z.string(),
							album: z.string(),
							duration: z.number().nullable(),
							coverUrl: z.string().nullable(),
							trackNumber: z.number().nullable(),
							year: z.number().nullable(),
						}),
					),
				},
			},
		},
		async () => {
			return app.container.musicController.list()
		},
	)

	server.get(
		'/music/:id',
		{
			schema: {
				params: z.object({
					id: z.string(),
				}),
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string }
			const music = await app.container.musicController.getById(id)

			if (!music) {
				return reply.status(404).send({ error: 'Music not found' })
			}

			return music
		},
	)
}
