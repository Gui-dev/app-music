import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const musics = sqliteTable('musics', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  duration: integer('duration'),
  filePath: text('file_path').notNull(),
  coverUrl: text('cover_url'),
  trackNumber: integer('track_number'),
  year: integer('year'),
})
