import type { Container } from '@/infra/container'

export class PlaylistController {
	constructor(private container: Container) {}

	async listPlaylists() {
		const playlists = await this.container.listPlaylists.execute()
		return playlists.map((p) => ({
			...p,
			createdAt: p.createdAt.toISOString(),
			updatedAt: p.updatedAt.toISOString(),
		}))
	}

	async createPlaylist(name: string) {
		const playlist = await this.container.createPlaylist.execute({ name })
		return {
			...playlist,
			createdAt: playlist.createdAt.toISOString(),
			updatedAt: playlist.updatedAt.toISOString(),
		}
	}

	async addMusicToPlaylist(playlistId: string, musicId: string) {
		await this.container.addMusicToPlaylist.execute({ playlistId, musicId })
		return { success: true }
	}

	async removeMusicFromPlaylist(playlistId: string, musicId: string) {
		await this.container.removeMusicFromPlaylist.execute({
			playlistId,
			musicId,
		})
		return { success: true }
	}
}
