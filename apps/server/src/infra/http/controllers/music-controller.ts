import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { SearchMusics } from '@/domain/usecases/music/search-musics'
import type { ListMusics } from '@/domain/usecases/music/list-musics'

export class MusicController {
	constructor(
		private readonly listMusics: ListMusics,
		private readonly searchMusics: SearchMusics,
		private readonly musicRepository: IMusicRepository,
	) {}

	async list() {
		return this.listMusics.execute()
	}

	async getById(id: string) {
		const music = await this.musicRepository.findById(id)
		if (!music) {
			return null
		}
		return music
	}

	async search(query: string) {
		return this.searchMusics.execute(query)
	}
}
