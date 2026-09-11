import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { Music } from '@/domain/entities'

export class ListMusics {
	constructor(private readonly musicRepository: IMusicRepository) {}

	async execute(): Promise<Music[]> {
		return this.musicRepository.findAll()
	}
}
