import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { MusicIdParamSchema } from '../../../schemas'

export async function coverRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/cover/:id',
		{
			schema: {
				params: MusicIdParamSchema,
			},
		},
		async (request) => {
			const { id } = request.params as { id: string }
			const music = await app.container.getMusicById.execute(id)

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
