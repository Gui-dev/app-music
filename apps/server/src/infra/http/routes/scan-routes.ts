import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'

export async function scanRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.post('/scan', async (request, reply) => {
		try {
			const result = await app.container.scanMusicLibrary.execute()
			return result
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Unable to scan music directory'
			return reply.status(500).send({ error: message })
		}
	})
}
