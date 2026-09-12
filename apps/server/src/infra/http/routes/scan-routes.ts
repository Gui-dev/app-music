import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function scanRoutes(app: FastifyInstance) {
	console.log('scanRoutes registered')
	const server = app.withTypeProvider<ZodTypeProvider>()

	try {
		server.post(
			'/scan',
			{
				schema: {
					body: z.object({
						path: z.string().optional(),
					}).nullable(),
				},
			},
			async (request, reply) => {
				console.log('INSIDE ROUTE HANDLER')
				const { path } = (request.body as { path?: string }) || {}
				const scanPath = path || process.env.MUSIC_PATH || '/music'
				console.log('scanPath:', scanPath)

				try {
					console.log('calling scanDirectory')
					const musics =
						await app.container.scannerService.scanDirectory(scanPath)
					return {
						count: musics.length,
						message: `Found ${musics.length} music files`,
					}
				} catch (error: any) {
					console.error('catch error:', error.message, error.stack)
					return reply.status(500).send({ error: error.message })
				}
			},
		)
		console.log('/scan route registered successfully')
	} catch (error: any) {
		console.error('register error:', error.message, error.stack)
	}
}
