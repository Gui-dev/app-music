import type { IPlaylistRepository } from '@/domain/contracts'
import type { Playlist } from '@/domain/entities'

export class InMemoryPlaylistRepository implements IPlaylistRepository {
	private playlists: Playlist[] = []

	async findAll(): Promise<Playlist[]> {
		return [...this.playlists]
	}

	async findById(id: string): Promise<Playlist | null> {
		return this.playlists.find((p) => p.id === id) ?? null
	}

	async create(name: string): Promise<Playlist> {
		const playlist: Playlist = {
			id: crypto.randomUUID(),
			name,
			musicIds: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		this.playlists.push(playlist)
		return playlist
	}

	async addMusic(playlistId: string, musicId: string): Promise<void> {
		const playlist = this.playlists.find((p) => p.id === playlistId)
		if (!playlist) return

		if (!playlist.musicIds.includes(musicId)) {
			playlist.musicIds.push(musicId)
			playlist.updatedAt = new Date()
		}
	}

	async removeMusic(playlistId: string, musicId: string): Promise<void> {
		const playlist = this.playlists.find((p) => p.id === playlistId)
		if (!playlist) return

		playlist.musicIds = playlist.musicIds.filter((id) => id !== musicId)
		playlist.updatedAt = new Date()
	}

	async delete(id: string): Promise<void> {
		this.playlists = this.playlists.filter((p) => p.id !== id)
	}

	clear(): void {
		this.playlists = []
	}
}
