import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import SqliteDatabase from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schemas'

export function createDatabase(dbPath?: string) {
  const resolvedPath = dbPath ?? join(process.cwd(), 'data', 'music.db')

  if (resolvedPath !== ':memory:') {
    const dir = dirname(resolvedPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

	const sqlite = new SqliteDatabase(resolvedPath)

	sqlite.pragma('journal_mode = WAL')
	sqlite.pragma('foreign_keys = ON')

	sqlite.exec(`
    CREATE TABLE IF NOT EXISTS musics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      duration INTEGER,
      file_path TEXT NOT NULL,
      cover_url TEXT,
      track_number INTEGER,
      year INTEGER
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_musics (
      playlist_id TEXT NOT NULL,
      music_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (playlist_id, music_id),
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (music_id) REFERENCES musics(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cover_cache (
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      PRIMARY KEY (artist, album)
    );
  `)

	const db = drizzle(sqlite, { schema })

	return db
}

export type AppDatabase = ReturnType<typeof createDatabase>
