import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/infra/database/schemas/*',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/music.db',
  },
})
