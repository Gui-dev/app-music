import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { musics } from './musics-schema'
import { playlists } from './playlists-schema'

export const playlistMusics = sqliteTable(
	'playlist_musics',
	{
		playlistId: text('playlist_id')
			.notNull()
			.references(() => playlists.id, { onDelete: 'cascade' }),
		musicId: text('music_id')
			.notNull()
			.references(() => musics.id, { onDelete: 'cascade' }),
		position: integer('position').notNull(),
	},
	(t) => [primaryKey({ columns: [t.playlistId, t.musicId] })],
)
