import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
})
