import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function scanRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.post(
		'/scan',
		{
			schema: {
				body: z.object({
					path: z.string().optional(),
				}),
			},
		},
		async (request, reply) => {
			const { path } = request.body as { path?: string }
			const scanPath = path || process.env.MUSIC_PATH || '/music'

			try {
				const musics =
					await app.container.scannerService.scanDirectory(scanPath)
				return {
					count: musics.length,
					message: `Found ${musics.length} music files`,
				}
			} catch (error: any) {
				return reply.status(500).send({ error: error.message })
			}
		},
	)
}
