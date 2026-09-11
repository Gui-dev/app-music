import type { Playlist } from '@/domain/entities'

export interface IPlaylistRepository {
	findAll(): Promise<Playlist[]>
	findById(id: string): Promise<Playlist | null>
	create(name: string): Promise<Playlist>
	addMusic(playlistId: string, musicId: string): Promise<void>
	removeMusic(playlistId: string, musicId: string): Promise<void>
	delete(id: string): Promise<void>
}
