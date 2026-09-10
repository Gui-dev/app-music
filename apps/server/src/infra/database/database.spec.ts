import { describe, it, expect, afterEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { createDatabase } from './database'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { musics, playlists } from './schemas'

describe('createDatabase', () => {
  const testDbPath = join(process.cwd(), 'test-data', 'test.db')

  afterEach(() => {
    if (existsSync(testDbPath)) {
      rmSync(testDbPath)
    }
  })

  it('should create a database file at the specified path', () => {
    const db = createDatabase(testDbPath)

    expect(existsSync(testDbPath)).toBe(true)
    expect(db).toBeDefined()
  })

  it('should create parent directories if they do not exist', () => {
    const nestedPath = join(process.cwd(), 'test-data', 'nested', 'dir', 'test.db')

    const _db = createDatabase(nestedPath)

    expect(existsSync(nestedPath)).toBe(true)
    rmSync(join(process.cwd(), 'test-data'), { recursive: true })
  })

  it('should enable WAL mode and foreign keys', () => {
    const db = createDatabase(testDbPath)

    const journalMode = db.$client.pragma('journal_mode', { simple: true })
    const foreignKeys = db.$client.pragma('foreign_keys', { simple: true })

    expect(journalMode).toBe('wal')
    expect(foreignKeys).toBe(1)
  })

  it('should allow inserting and querying music via Drizzle', async () => {
    const db = createDatabase(testDbPath)

    await db.insert(musics).values({
      id: '1',
      title: 'Song Title',
      artist: 'Artist Name',
      album: 'Album Name',
      duration: 180,
      filePath: '/path/to/file.mp3',
    })

    const result = await db.select().from(musics).where(eq(musics.id, '1'))

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].title).toBe('Song Title')
    expect(result[0].artist).toBe('Artist Name')
    expect(result[0].album).toBe('Album Name')
    expect(result[0].duration).toBe(180)
    expect(result[0].filePath).toBe('/path/to/file.mp3')
  })

  it('should allow inserting and querying playlists via Drizzle', async () => {
    const db = createDatabase(testDbPath)

    await db.insert(playlists).values({
      id: '1',
      name: 'My Playlist',
    })

    const result = await db.select().from(playlists).where(eq(playlists.id, '1'))

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].name).toBe('My Playlist')
  })
})
