import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { IPlaylistRepository } from '@/domain/contracts/repositories/i-playlist-repository'
import { DomainError } from '@/domain/errors/domain-error'

export interface AddMusicToPlaylistInput {
	playlistId: string
	musicId: string
}

export class AddMusicToPlaylist {
	constructor(
		private readonly playlistRepository: IPlaylistRepository,
		private readonly musicRepository: IMusicRepository,
	) {}

	async execute(input: AddMusicToPlaylistInput): Promise<void> {
		const playlist = await this.playlistRepository.findById(input.playlistId)

		if (!playlist) {
			throw new DomainError('PLAYLIST_NOT_FOUND', 'Playlist not found', 404)
		}

		const music = await this.musicRepository.findById(input.musicId)

		if (!music) {
			throw new DomainError('MUSIC_NOT_FOUND', 'Music not found', 404)
		}

		if (playlist.musicIds.includes(input.musicId)) {
			throw new DomainError(
				'MUSIC_ALREADY_IN_PLAYLIST',
				'Music is already in this playlist',
			)
		}

		await this.playlistRepository.addMusic(input.playlistId, input.musicId)
	}
}
