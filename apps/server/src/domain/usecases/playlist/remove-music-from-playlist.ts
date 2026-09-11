import type { IPlaylistRepository } from '@/domain/contracts/repositories/i-playlist-repository'
import { DomainError } from '@/domain/errors/domain-error'

export interface RemoveMusicFromPlaylistInput {
	playlistId: string
	musicId: string
}

export class RemoveMusicFromPlaylist {
	constructor(private readonly playlistRepository: IPlaylistRepository) {}

	async execute(input: RemoveMusicFromPlaylistInput): Promise<void> {
		const playlist = await this.playlistRepository.findById(input.playlistId)

		if (!playlist) {
			throw new DomainError('PLAYLIST_NOT_FOUND', 'Playlist not found', 404)
		}

		if (!playlist.musicIds.includes(input.musicId)) {
			throw new DomainError(
				'MUSIC_NOT_IN_PLAYLIST',
				'Music is not in this playlist',
			)
		}

		await this.playlistRepository.removeMusic(input.playlistId, input.musicId)
	}
}
