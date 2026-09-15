import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import {
	MusicSchema,
	PlaylistSchema,
	ScanResultSchema,
	type Music,
	type Playlist,
	type ScanResult,
} from '@shared/schemas'

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

export type { Music, Playlist, ScanResult }

export const musicApi = {
	async listMusics(): Promise<Music[]> {
		const { data } = await api.get('/music')
		return MusicSchema.array().parse(data)
	},

	async getMusic(id: string): Promise<Music> {
		const { data } = await api.get(`/music/${id}`)
		return MusicSchema.parse(data)
	},

	async searchMusics(query: string): Promise<Music[]> {
		const { data } = await api.get('/search', { params: { q: query } })
		return MusicSchema.array().parse(data)
	},

	getStreamUrl(id: string): string {
		return `${API_BASE}/stream/${id}`
	},

	getCoverUrl(id: string): string {
		return `${API_BASE}/cover/${id}`
	},

	async listPlaylists(): Promise<Playlist[]> {
		const { data } = await api.get('/playlists')
		return PlaylistSchema.array().parse(data)
	},

	async createPlaylist(name: string): Promise<Playlist> {
		const { data } = await api.post('/playlists', { name })
		return PlaylistSchema.parse(data)
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

	async scanDirectory(path?: string): Promise<ScanResult> {
		const { data } = await api.post('/scan', { path })
		return ScanResultSchema.parse(data)
	},
}
