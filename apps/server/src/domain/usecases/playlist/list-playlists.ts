import type { IPlaylistRepository } from '@/domain/contracts/repositories/i-playlist-repository'
import type { Playlist } from '@/domain/entities'

export class ListPlaylists {
	constructor(private readonly playlistRepository: IPlaylistRepository) {}

	async execute(): Promise<Playlist[]> {
		return this.playlistRepository.findAll()
	}
}
