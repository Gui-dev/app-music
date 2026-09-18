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
	name: z.string(),
})

export const IdParamSchema = z.object({
	id: z.string(),
})

export const AddMusicToPlaylistBodySchema = z.object({
	musicId: z.string(),
})

export const RemoveMusicFromPlaylistParamsSchema = z.object({
	id: z.string(),
	musicId: z.string(),
})

export const SearchQuerySchema = z.object({
	q: z.string(),
})

export const MusicIdParamSchema = z.object({
	id: z.string(),
})

export const CoverResponseSchema = z.object({
	coverUrl: z.string().nullable(),
})

export const ErrorSchema = z.object({
	error: z.string(),
})
