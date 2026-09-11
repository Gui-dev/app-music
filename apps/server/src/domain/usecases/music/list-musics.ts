import type { Music } from '../../entities'
import type { IMusicRepository } from '../../contracts/repositories/i-music-repository'

export class ListMusics {
  constructor(private readonly musicRepository: IMusicRepository) {}

  async execute(): Promise<Music[]> {
    return this.musicRepository.findAll()
  }
}
