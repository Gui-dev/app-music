import type { AddMusicToPlaylist } from '@/domain/usecases/playlist/add-music-to-playlist'
import type { CreatePlaylist } from '@/domain/usecases/playlist/create-playlist'
import type { ListPlaylists } from '@/domain/usecases/playlist/list-playlists'
import type { RemoveMusicFromPlaylist } from '@/domain/usecases/playlist/remove-music-from-playlist'

export class PlaylistController {
	constructor(
		private readonly listPlaylists: ListPlaylists,
		private readonly createPlaylist: CreatePlaylist,
		private readonly addMusicToPlaylist: AddMusicToPlaylist,
		private readonly removeMusicFromPlaylist: RemoveMusicFromPlaylist,
	) {}

	async list() {
		const playlists = await this.listPlaylists.execute()
		return playlists.map((p) => ({
			...p,
			createdAt: p.createdAt.toISOString(),
			updatedAt: p.updatedAt.toISOString(),
		}))
	}

	async create(name: string) {
		const playlist = await this.createPlaylist.execute({ name })
		return {
			...playlist,
			createdAt: playlist.createdAt.toISOString(),
			updatedAt: playlist.updatedAt.toISOString(),
		}
	}

	async addMusic(playlistId: string, musicId: string) {
		await this.addMusicToPlaylist.execute({ playlistId, musicId })
		return { success: true }
	}

	async removeMusic(playlistId: string, musicId: string) {
		await this.removeMusicFromPlaylist.execute({ playlistId, musicId })
		return { success: true }
	}
}
