import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const coverCache = sqliteTable(
	'cover_cache',
	{
		artist: text('artist').notNull(),
		album: text('album').notNull(),
		coverUrl: text('cover_url').notNull(),
	},
	(t) => [primaryKey({ columns: [t.artist, t.album] })],
)
