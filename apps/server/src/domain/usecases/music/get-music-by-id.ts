import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { Music } from '@/domain/entities'
import { DomainError } from '@/domain/errors/domain-error'

export class GetMusicById {
	constructor(private readonly musicRepository: IMusicRepository) {}

	async execute(id: string): Promise<Music> {
		const music = await this.musicRepository.findById(id)

		if (!music) {
			throw new DomainError('MUSIC_NOT_FOUND', 'Music not found', 404)
		}

		return music
	}
}
