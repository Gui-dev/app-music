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
					body: z
						.object({
							path: z.string().optional(),
						})
						.nullable(),
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
					await app.container.musicRepository.saveMany(musics)
					return {
						count: musics.length,
						message: `Found ${musics.length} music files`,
					}
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: 'Unable to scan music directory'
					console.error('catch error:', error)
					return reply.status(500).send({ error: message })
				}
			},
		)
		console.log('/scan route registered successfully')
	} catch (error) {
		console.error('register error:', error)
	}
}
