import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { MusicIdParamSchema, MusicSchema } from '../../../schemas'

export async function musicRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/music',
		{
			schema: {
				response: {
					200: z.array(MusicSchema),
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
				params: MusicIdParamSchema,
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
