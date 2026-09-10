import { describe, it, expect, afterEach } from 'vitest'
import { createDatabase } from './SQLite'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'

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
    expect(db).toBeInstanceOf(Database)
    db.close()
  })

  it('should create parent directories if they do not exist', () => {
    const nestedPath = join(process.cwd(), 'test-data', 'nested', 'dir', 'test.db')

    const db = createDatabase(nestedPath)

    expect(existsSync(nestedPath)).toBe(true)
    db.close()
    rmSync(join(process.cwd(), 'test-data'), { recursive: true })
  })

  it('should enable WAL mode and foreign keys', () => {
    const db = createDatabase(testDbPath)

    const journalMode = db.pragma('journal_mode', { simple: true })
    const foreignKeys = db.pragma('foreign_keys', { simple: true })

    expect(journalMode).toBe('wal')
    expect(foreignKeys).toBe(1)
    db.close()
  })

  it('should create all required tables', () => {
    const db = createDatabase(testDbPath)

    const rows = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[]
    const tables = rows.map((row) => row.name)

    expect(tables).toContain('musics')
    expect(tables).toContain('playlists')
    expect(tables).toContain('playlist_musics')
    expect(tables).toContain('cover_cache')
    db.close()
  })

  it('should allow inserting and querying music', () => {
    const db = createDatabase(testDbPath)

    db.prepare(
      'INSERT INTO musics (id, title, artist, album, duration, file_path) VALUES (?, ?, ?, ?, ?, ?)',
    ).run('1', 'Song Title', 'Artist Name', 'Album Name', 180, '/path/to/file.mp3')

    const music = db.prepare('SELECT * FROM musics WHERE id = ?').get('1') as {
      id: string
      title: string
      artist: string
      album: string
      duration: number
      file_path: string
    }

    expect(music.id).toBe('1')
    expect(music.title).toBe('Song Title')
    expect(music.artist).toBe('Artist Name')
    expect(music.album).toBe('Album Name')
    expect(music.duration).toBe(180)
    expect(music.file_path).toBe('/path/to/file.mp3')
    db.close()
  })
})
