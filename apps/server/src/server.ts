import 'dotenv/config'
import cors from '@fastify/cors'
import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import {
	serializerCompiler,
	validatorCompiler,
} from '@fastify/type-provider-zod'
import fastify from 'fastify'
import { createContainer } from './infra/container'
import { errorHandler } from './infra/http/middleware/error-handler'
import { coverRoutes } from './infra/http/routes/cover-routes'
import { musicRoutes } from './infra/http/routes/music-routes'
import { playlistRoutes } from './infra/http/routes/playlist-routes'
import { scanRoutes } from './infra/http/routes/scan-routes'
import { searchRoutes } from './infra/http/routes/search-routes'
import { streamRoutes } from './infra/http/routes/stream-routes'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cors, {
	origin: true,
})

app.setErrorHandler(errorHandler)

const container = createContainer()
console.log('Container created, scannerService:', typeof container.scannerService)
app.decorate('container', container)

const server = app.withTypeProvider<ZodTypeProvider>()

server.get('/', async () => {
	return { status: 'ok', message: 'Music Streaming API' }
})

app.register(musicRoutes)
app.register(searchRoutes)
app.register(streamRoutes)
app.register(coverRoutes)
app.register(playlistRoutes)
app.register(scanRoutes)

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
