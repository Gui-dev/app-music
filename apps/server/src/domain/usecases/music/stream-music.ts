import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type {
	FileStream,
	IFileStorage,
} from '@/domain/contracts/services/i-file-storage'
import type { Music } from '@/domain/entities'
import { DomainError } from '@/domain/errors/domain-error'

export interface StreamMusicInput {
	musicId: string
	range?: string
}

export interface StreamMusicOutput {
	stream: FileStream
	music: Music
	start: number
	end: number
	totalSize: number
}

export class StreamMusic {
	constructor(
		private readonly musicRepository: IMusicRepository,
		private readonly fileStorage: IFileStorage,
	) {}

	async execute(input: StreamMusicInput): Promise<StreamMusicOutput> {
		const music = await this.musicRepository.findById(input.musicId)

		if (!music) {
			throw new DomainError('MUSIC_NOT_FOUND', 'Music not found', 404)
		}

		const fileInfo = await this.fileStorage.getFileInfo(music.filePath)
		const { start, end } = this.parseRange(input.range, fileInfo.size)

		const stream = await this.fileStorage.getStream(music.filePath, start, end)

		return {
			stream,
			music,
			start,
			end,
			totalSize: fileInfo.size,
		}
	}

	private parseRange(
		range: string | undefined,
		totalSize: number,
	): { start: number; end: number } {
		if (!range) {
			return { start: 0, end: totalSize - 1 }
		}

		const parts = range.replace(/bytes=/, '').split('-')
		const start = Number.parseInt(parts[0], 10)
		const end = parts[1] ? Number.parseInt(parts[1], 10) : totalSize - 1

		return { start, end }
	}
}
