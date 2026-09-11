import 'fastify'
import type { Container } from '../infra/container'

declare module 'fastify' {
	interface FastifyInstance {
		container: Container
	}
}
