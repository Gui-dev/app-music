import type { Music } from '@/domain/entities'

export interface IMusicRepository {
	findAll(): Promise<Music[]>
	findById(id: string): Promise<Music | null>
	search(query: string): Promise<Music[]>
	findByAlbum(album: string): Promise<Music[]>
	findByArtist(artist: string): Promise<Music[]>
	save(music: Music): Promise<void>
	saveMany(musics: Music[]): Promise<void>
}
