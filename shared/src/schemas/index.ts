import { z } from 'zod'

export const MusicSchema = z.object({
	id: z.string(),
	title: z.string(),
	artist: z.string(),
	album: z.string(),
	duration: z.number().nullable(),
	coverUrl: z.string().nullable(),
	trackNumber: z.number().nullable(),
	year: z.number().nullable(),
})

export const PlaylistSchema = z.object({
	id: z.string(),
	name: z.string(),
	musicIds: z.array(z.string()),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const CreatePlaylistSchema = z.object({
	name: z.string().min(1).max(100),
})

export const ScanResultSchema = z.object({
	count: z.number(),
	message: z.string(),
})

export type Music = z.infer<typeof MusicSchema>
export type Playlist = z.infer<typeof PlaylistSchema>
export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>
export type ScanResult = z.infer<typeof ScanResultSchema>
