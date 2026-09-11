export interface ICoverService {
	getCover(artist: string, album: string): Promise<string | null>
}
