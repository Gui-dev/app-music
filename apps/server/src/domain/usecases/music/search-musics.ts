import type { Music } from '@/domain/entities'
import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import { DomainError } from '@/domain/errors/domain-error'

export class SearchMusics {
  constructor(private readonly musicRepository: IMusicRepository) {}

  async execute(query: string): Promise<Music[]> {
    if (!query || query.trim().length === 0) {
      throw new DomainError('QUERY_REQUIRED', 'Search query is required')
    }

    return this.musicRepository.search(query.trim())
  }
}
