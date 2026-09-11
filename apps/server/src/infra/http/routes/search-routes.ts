import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function searchRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/search',
		{
			schema: {
				querystring: z.object({
					q: z.string(),
				}),
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							title: z.string(),
							artist: z.string(),
							album: z.string(),
							duration: z.number(),
							coverUrl: z.string().nullable(),
							trackNumber: z.number().nullable(),
							year: z.number().nullable(),
						}),
					),
				},
			},
		},
		async (request) => {
			const { q } = request.query as { q: string }
			return app.container.searchMusics.execute(q)
		},
	)
}
