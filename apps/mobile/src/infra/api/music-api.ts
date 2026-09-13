import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const defaultApiBase = Platform.select({
	// Android emulators access the host machine through this special address.
	android: 'http://10.0.2.2:3000',
	default: 'http://localhost:3000',
})

// On a physical device, configure EXPO_PUBLIC_API_BASE with the LAN address of
// the computer running the API (for example, http://192.168.1.100:3000).
const API_BASE = (
	Constants.expoConfig?.extra?.apiBase ?? defaultApiBase
).replace(/\/$/, '')

const api = axios.create({
	baseURL: API_BASE,
})

export interface Music {
	id: string
	title: string
	artist: string
	album: string
	duration: number | null
	filePath: string
	coverUrl: string | null
	trackNumber: number | null
	year: number | null
}

export interface Playlist {
	id: string
	name: string
	musicIds: string[]
	createdAt: string
	updatedAt: string
}

export const musicApi = {
	async listMusics(): Promise<Music[]> {
		const { data } = await api.get<Music[]>('/music')
		return data
	},

	async getMusic(id: string): Promise<Music> {
		const { data } = await api.get<Music>(`/music/${id}`)
		return data
	},

	async searchMusics(query: string): Promise<Music[]> {
		const { data } = await api.get<Music[]>('/search', { params: { q: query } })
		return data
	},

	getStreamUrl(id: string): string {
		return `${API_BASE}/stream/${id}`
	},

	getCoverUrl(id: string): string {
		return `${API_BASE}/cover/${id}`
	},

	async listPlaylists(): Promise<Playlist[]> {
		const { data } = await api.get<Playlist[]>('/playlists')
		return data
	},

	async createPlaylist(name: string): Promise<Playlist> {
		const { data } = await api.post<Playlist>('/playlists', { name })
		return data
	},

	async addMusicToPlaylist(playlistId: string, musicId: string): Promise<void> {
		await api.post(`/playlists/${playlistId}/add`, { musicId })
	},

	async removeMusicFromPlaylist(
		playlistId: string,
		musicId: string,
	): Promise<void> {
		await api.delete(`/playlists/${playlistId}/remove/${musicId}`)
	},

	async scanDirectory(
		path?: string,
	): Promise<{ count: number; message: string }> {
		const { data } = await api.post('/scan', { path })
		return data
	},
}
