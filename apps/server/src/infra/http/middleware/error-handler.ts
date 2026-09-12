import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export async function errorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	request.log.error(error)

	const statusCode = error.statusCode || 500
	const message = error.message || 'Internal Server Error'

	reply.status(statusCode).send({
		error: message,
		statusCode,
	})
}
