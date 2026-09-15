import { describe, it, expect } from 'vitest'
import { HttpResponse, http } from 'msw'
import { server } from '../../mocks/server'
import { mockMusics, mockPlaylists } from '../../mocks/handlers'

async function importApi() {
	const mod = await import('./music-api')
	return mod.musicApi
}

describe('musicApi validation', () => {
	it('listMusics returns validated Music[]', async () => {
		const musicApi = await importApi()
		const result = await musicApi.listMusics()
		expect(result).toEqual(mockMusics)
		expect(result[0]).toHaveProperty('id')
		expect(result[0]).toHaveProperty('title')
		expect(result[0]).not.toHaveProperty('filePath')
	})

	it('getMusic returns validated Music', async () => {
		const musicApi = await importApi()
		const result = await musicApi.getMusic('1')
		expect(result).toEqual(mockMusics[0])
	})

	it('searchMusics returns validated Music[]', async () => {
		const musicApi = await importApi()
		const result = await musicApi.searchMusics('queen')
		expect(result).toEqual([mockMusics[0]])
	})

	it('listPlaylists returns validated Playlist[]', async () => {
		const musicApi = await importApi()
		const result = await musicApi.listPlaylists()
		expect(result).toEqual(mockPlaylists)
		expect(result[0]).toHaveProperty('createdAt')
		expect(typeof result[0].createdAt).toBe('string')
	})

	it('createPlaylist returns validated Playlist', async () => {
		const musicApi = await importApi()
		const result = await musicApi.createPlaylist('New Playlist')
		expect(result).toHaveProperty('id')
		expect(result).toHaveProperty('name', 'New Playlist')
		expect(result).toHaveProperty('musicIds')
	})

	it('scanDirectory returns validated ScanResult', async () => {
		const musicApi = await importApi()
		const result = await musicApi.scanDirectory()
		expect(result).toHaveProperty('count')
		expect(result).toHaveProperty('message')
		expect(typeof result.count).toBe('number')
	})

	it('throws on invalid API response', async () => {
		server.use(
			http.get('*/music', () => {
				return HttpResponse.json([{ id: 123, invalid: true }])
			}),
		)

		const musicApi = await importApi()
		await expect(musicApi.listMusics()).rejects.toThrow()

		// Restore default handlers
		server.use(
			http.get('*/music', () => {
				return HttpResponse.json(mockMusics)
			}),
		)
	})
})
