import { MusicSchema } from '@shared/schemas'
import fastify from 'fastify'
import { buildJsonSchemas, register as fastifyZod } from 'fastify-zod'

const app = fastify()

const { schemas, $ref } = buildJsonSchemas({
	Music: MusicSchema,
})

app.register(fastifyZod, {
	jsonSchemas: { schemas, $ref },
})

app.get('/', async () => {
	return { status: 'ok', message: 'Music Streaming API' }
})

const start = async () => {
	try {
		await app.listen({ port: 3000 })
		console.log('Server running on http://localhost:3000')
		console.log(
			'Documentation available at http://localhost:3000/documentation',
		)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
