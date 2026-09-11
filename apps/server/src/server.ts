import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import {
	serializerCompiler,
	validatorCompiler,
} from '@fastify/type-provider-zod'
import fastify from 'fastify'
import { createContainer } from './infra/container'
import { coverRoutes } from './infra/http/routes/cover-routes'
import { musicRoutes } from './infra/http/routes/music-routes'
import { searchRoutes } from './infra/http/routes/search-routes'
import { streamRoutes } from './infra/http/routes/stream-routes'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const container = createContainer()
app.decorate('container', container)

const server = app.withTypeProvider<ZodTypeProvider>()

server.get('/', async () => {
	return { status: 'ok', message: 'Music Streaming API' }
})

app.register(musicRoutes)
app.register(searchRoutes)
app.register(streamRoutes)
app.register(coverRoutes)

const start = async () => {
	try {
		await server.listen({ port: 3000 })
		console.log('Server running on http://localhost:3000')
	} catch (err) {
		server.log.error(err)
		process.exit(1)
	}
}

start()
