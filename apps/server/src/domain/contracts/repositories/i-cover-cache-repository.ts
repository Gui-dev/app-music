export interface ICoverCacheRepository {
	findByArtistAlbum(artist: string, album: string): Promise<string | null>
	save(artist: string, album: string, coverUrl: string): Promise<void>
}
