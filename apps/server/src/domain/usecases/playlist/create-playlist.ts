import type { IPlaylistRepository } from '@/domain/contracts/repositories/i-playlist-repository'
import type { Playlist } from '@/domain/entities'
import { DomainError } from '@/domain/errors/domain-error'

export interface CreatePlaylistInput {
	name: string
}

export class CreatePlaylist {
	constructor(private readonly playlistRepository: IPlaylistRepository) {}

	async execute(input: CreatePlaylistInput): Promise<Playlist> {
		if (!input.name || input.name.trim().length === 0) {
			throw new DomainError('NAME_REQUIRED', 'Playlist name is required')
		}

		const existing = await this.playlistRepository.findByName(input.name.trim())

		if (existing) {
			throw new DomainError(
				'DUPLICATE_NAME',
				'A playlist with this name already exists',
			)
		}

		const playlist = await this.playlistRepository.create(input.name.trim())

		return playlist
	}
}
