import type { Container } from '@/infra/container'

export class MusicController {
	constructor(private container: Container) {}

	async listMusics() {
		const musics = await this.container.listMusics.execute()
		return musics
	}

	async getMusicById(id: string) {
		const musics = await this.container.listMusics.execute()
		const found = musics.find((m) => m.id === id)
		if (!found) {
			throw new Error('Music not found')
		}
		return found
	}

	async searchMusics(query: string) {
		const musics = await this.container.searchMusics.execute(query)
		return musics
	}
}
