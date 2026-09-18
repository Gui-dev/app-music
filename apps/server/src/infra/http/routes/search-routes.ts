import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { MusicSchema, SearchQuerySchema } from '../../../schemas'

export async function searchRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/search',
		{
			schema: {
				querystring: SearchQuerySchema,
				response: {
					200: z.array(MusicSchema),
				},
			},
		},
		async (request) => {
			const { q } = request.query as { q: string }
			return app.container.searchMusics.execute(q)
		},
	)
}
