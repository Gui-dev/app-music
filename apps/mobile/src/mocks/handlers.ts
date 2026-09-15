import { HttpResponse, http } from 'msw'
import type { Music, Playlist } from '../infra/api/music-api'

const mockMusics: Music[] = [
	{
		id: '1',
		title: 'Bohemian Rhapsody',
		artist: 'Queen',
		album: 'A Night at the Opera',
		duration: 354,
		filePath: '/music/bohemian-rhapsody.mp3',
		coverUrl: null,
		trackNumber: 11,
		year: 1975,
	},
	{
		id: '2',
		title: 'Stairway to Heaven',
		artist: 'Led Zeppelin',
		album: 'Led Zeppelin IV',
		duration: 482,
		filePath: '/music/stairway-to-heaven.mp3',
		coverUrl: null,
		trackNumber: 4,
		year: 1971,
	},
	{
		id: '3',
		title: 'Hotel California',
		artist: 'Eagles',
		album: 'Hotel California',
		duration: 391,
		filePath: '/music/hotel-california.mp3',
		coverUrl: null,
		trackNumber: 5,
		year: 1977,
	},
]

const mockPlaylists: Playlist[] = [
	{
		id: '1',
		name: 'Rock Classics',
		musicIds: ['1', '2'],
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-15T10:00:00Z',
	},
	{
		id: '2',
		name: 'Chill Vibes',
		musicIds: ['3'],
		createdAt: '2024-02-20T14:30:00Z',
		updatedAt: '2024-02-20T14:30:00Z',
	},
]

export { mockMusics, mockPlaylists }

export const handlers = [
	http.get('*/music', () => {
		return HttpResponse.json(mockMusics)
	}),

	http.get('*/music/:id', ({ params }) => {
		const music = mockMusics.find((m) => m.id === params.id)
		if (!music) {
			return new HttpResponse(null, { status: 404 })
		}
		return HttpResponse.json(music)
	}),

	http.get('*/search', ({ request }) => {
		const url = new URL(request.url)
		const query = url.searchParams.get('q')?.toLowerCase() ?? ''
		const filtered = mockMusics.filter(
			(m) =>
				m.title.toLowerCase().includes(query) ||
				m.artist.toLowerCase().includes(query) ||
				m.album.toLowerCase().includes(query),
		)
		return HttpResponse.json(filtered)
	}),

	http.get('*/playlists', () => {
		return HttpResponse.json(mockPlaylists)
	}),

	http.post('*/playlists', async ({ request }) => {
		const body = (await request.json()) as { name: string }
		const newPlaylist: Playlist = {
			id: String(mockPlaylists.length + 1),
			name: body.name,
			musicIds: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		mockPlaylists.push(newPlaylist)
		return HttpResponse.json(newPlaylist, { status: 201 })
	}),

	http.post('*/playlists/:id/add', async ({ params, request }) => {
		const body = (await request.json()) as { musicId: string }
		const playlist = mockPlaylists.find((p) => p.id === params.id)
		if (!playlist) {
			return new HttpResponse(null, { status: 404 })
		}
		playlist.musicIds.push(body.musicId)
		playlist.updatedAt = new Date().toISOString()
		return new HttpResponse(null, { status: 204 })
	}),

	http.delete('*/playlists/:id/remove/:musicId', ({ params }) => {
		const playlist = mockPlaylists.find((p) => p.id === params.id)
		if (!playlist) {
			return new HttpResponse(null, { status: 404 })
		}
		playlist.musicIds = playlist.musicIds.filter((id) => id !== params.musicId)
		playlist.updatedAt = new Date().toISOString()
		return new HttpResponse(null, { status: 204 })
	}),

	http.post('*/scan', () => {
		return HttpResponse.json({
			count: mockMusics.length,
			message: 'Scan complete',
		})
	}),
]
