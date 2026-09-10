import { eq, like, or } from 'drizzle-orm'
import type { Music } from '../../domain/entities'
import type { IMusicRepository } from '../../domain/contracts'
import type { AppDatabase } from '../database/database'
import { musics } from '../database/schemas'

export class MusicRepository implements IMusicRepository {
  constructor(private readonly db: AppDatabase) {}

  async findAll(): Promise<Music[]> {
    const rows = await this.db.select().from(musics)
    return rows.map(this.toDomain)
  }

  async findById(id: string): Promise<Music | null> {
    const rows = await this.db
      .select()
      .from(musics)
      .where(eq(musics.id, id))
      .limit(1)

    return rows[0] ? this.toDomain(rows[0]) : null
  }

  async search(query: string): Promise<Music[]> {
    const pattern = `%${query}%`
    const rows = await this.db
      .select()
      .from(musics)
      .where(
        or(
          like(musics.title, pattern),
          like(musics.artist, pattern),
          like(musics.album, pattern),
        ),
      )

    return rows.map(this.toDomain)
  }

  async findByAlbum(album: string): Promise<Music[]> {
    const rows = await this.db
      .select()
      .from(musics)
      .where(eq(musics.album, album))

    return rows.map(this.toDomain)
  }

  async findByArtist(artist: string): Promise<Music[]> {
    const rows = await this.db
      .select()
      .from(musics)
      .where(eq(musics.artist, artist))

    return rows.map(this.toDomain)
  }

  async save(music: Music): Promise<void> {
    await this.db
      .insert(musics)
      .values(this.toRow(music))
      .onConflictDoUpdate({
        target: musics.id,
        set: this.toRow(music),
      })
  }

  async saveMany(musicsList: Music[]): Promise<void> {
    const rows = musicsList.map(this.toRow)
    await this.db
      .insert(musics)
      .values(rows)
      .onConflictDoUpdate({
        target: musics.id,
        set: { id: musics.id },
      })
  }

  private toDomain(row: typeof musics.$inferSelect): Music {
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album,
      duration: row.duration,
      filePath: row.filePath,
      coverUrl: row.coverUrl,
      trackNumber: row.trackNumber,
      year: row.year,
    }
  }

  private toRow(music: Music): typeof musics.$inferInsert {
    return {
      id: music.id,
      title: music.title,
      artist: music.artist,
      album: music.album,
      duration: music.duration,
      filePath: music.filePath,
      coverUrl: music.coverUrl,
      trackNumber: music.trackNumber,
      year: music.year,
    }
  }
}
