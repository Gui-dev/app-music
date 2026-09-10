import type { ZodTypeProvider } from '@fastify/type-provider-zod'
import {
  serializerCompiler,
  validatorCompiler,
} from '@fastify/type-provider-zod'
import fastify from 'fastify'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const server = app.withTypeProvider<ZodTypeProvider>()

server.get('/', async () => {
  return { status: 'ok', message: 'Music Streaming API' }
})

const start = async () => {
  try {
    await server.listen({ port: 3000 })
    console.log('Server running on http://localhost:3000')
    console.log(
      'Documentation available at http://localhost:3000/documentation',
    )
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
