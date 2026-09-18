import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'

export async function errorHandler(
	error: FastifyError | DomainError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	request.log.error({ err: error }, error.message)

	if (error instanceof DomainError) {
		return reply.status(error.statusCode).send({
			error: error.message,
			code: error.code,
		})
	}

	const statusCode = error.statusCode || 500
	const message = error.message || 'Internal Server Error'

	reply.status(statusCode).send({
		error: message,
		statusCode,
	})
}
