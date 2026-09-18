import type { Readable } from 'node:stream'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import type { FastifyInstance } from 'fastify'
import { MusicIdParamSchema } from '../../../schemas'

export async function streamRoutes(app: FastifyInstance) {
	const server = app.withTypeProvider<ZodTypeProvider>()

	server.get(
		'/stream/:id',
		{
			schema: {
				params: MusicIdParamSchema,
			},
		},
		async (request, reply) => {
			const { id } = request.params as { id: string }
			const range = request.headers.range

			try {
				const result = await app.container.streamMusic.execute({
					musicId: id,
					range,
				})

				const contentLength = result.end - result.start + 1
				const isPartial = range !== undefined

				reply.header('Accept-Ranges', 'bytes')
				reply.header('Content-Length', contentLength)
				reply.header('Content-Type', result.stream.contentType)
				reply.header('Cache-Control', 'no-store')

				if (isPartial) {
					reply.status(206)
					reply.header(
						'Content-Range',
						`bytes ${result.start}-${result.end}/${result.totalSize}`,
					)
				}

				return reply.send(result.stream.stream as unknown as Readable)
			} catch (error: any) {
				if (error.statusCode === 404) {
					return reply.status(404).send({ error: error.message })
				}
				throw error
			}
		},
	)
}
