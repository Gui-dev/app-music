import { createReadStream, statSync } from 'node:fs'
import type { Readable } from 'node:stream'
import type {
	FileStream,
	IFileStorage,
} from '@/domain/contracts/services/i-file-storage'

export class LocalFileStorage implements IFileStorage {
	constructor(private readonly basePath: string) {}

	async getStream(
		filePath: string,
		start?: number,
		end?: number,
	): Promise<FileStream> {
		const fullPath = `${this.basePath}/${filePath}`
		const stream = createReadStream(fullPath, { start, end })

		return {
			stream: stream as unknown as Readable,
			contentType: 'audio/mpeg',
			totalSize: end !== undefined ? end + 1 : statSync(fullPath).size,
		}
	}

	async getFileInfo(
		filePath: string,
	): Promise<{ size: number; contentType: string }> {
		const fullPath = `${this.basePath}/${filePath}`
		const stats = statSync(fullPath)

		return {
			size: stats.size,
			contentType: 'audio/mpeg',
		}
	}
}
