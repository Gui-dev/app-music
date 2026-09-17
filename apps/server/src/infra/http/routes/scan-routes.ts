import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function scanRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.post(
		'/scan',
		{
			schema: {
				body: z
					.object({
						path: z.string().optional(),
					})
					.nullable(),
			},
		},
		async (request, reply) => {
			const { path } = (request.body as { path?: string }) || {}

			try {
				const result = await app.container.scanMusicLibrary.execute({ path })
				return result
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: 'Unable to scan music directory'
				return reply.status(500).send({ error: message })
			}
		},
	)
}
