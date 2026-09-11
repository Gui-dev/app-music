import type { Music } from '../../domain/entities'
import type { IMusicRepository } from '../../domain/contracts'

export class InMemoryMusicRepository implements IMusicRepository {
  private musics: Music[] = []

  async findAll(): Promise<Music[]> {
    return [...this.musics]
  }

  async findById(id: string): Promise<Music | null> {
    return this.musics.find((m) => m.id === id) ?? null
  }

  async search(query: string): Promise<Music[]> {
    const pattern = query.toLowerCase()
    return this.musics.filter(
      (m) =>
        m.title.toLowerCase().includes(pattern) ||
        m.artist.toLowerCase().includes(pattern) ||
        m.album.toLowerCase().includes(pattern),
    )
  }

  async findByAlbum(album: string): Promise<Music[]> {
    return this.musics.filter((m) => m.album === album)
  }

  async findByArtist(artist: string): Promise<Music[]> {
    return this.musics.filter((m) => m.artist === artist)
  }

  async save(music: Music): Promise<void> {
    const index = this.musics.findIndex((m) => m.id === music.id)
    if (index >= 0) {
      this.musics[index] = music
    } else {
      this.musics.push(music)
    }
  }

  async saveMany(musics: Music[]): Promise<void> {
    for (const music of musics) {
      await this.save(music)
    }
  }

  clear(): void {
    this.musics = []
  }
}
