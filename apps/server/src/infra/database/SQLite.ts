import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

export function createDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? join(process.cwd(), 'data', 'music.db')

  const dir = dirname(resolvedPath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const db = new Database(resolvedPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initializeSchema(db)

  return db
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
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
}
