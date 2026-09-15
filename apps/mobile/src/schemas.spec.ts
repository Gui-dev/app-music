import { describe, it, expect } from 'vitest'
import {
	MusicSchema,
	PlaylistSchema,
	CreatePlaylistSchema,
	ScanResultSchema,
} from '@shared/schemas'

describe('MusicSchema', () => {
	const validMusic = {
		id: '1',
		title: 'Bohemian Rhapsody',
		artist: 'Queen',
		album: 'A Night at the Opera',
		duration: 354,
		coverUrl: null,
		trackNumber: 11,
		year: 1975,
	}

	it('accepts valid music data', () => {
		expect(MusicSchema.parse(validMusic)).toEqual(validMusic)
	})

	it('accepts null duration', () => {
		const data = { ...validMusic, duration: null }
		expect(MusicSchema.parse(data)).toEqual(data)
	})

	it('accepts null coverUrl', () => {
		const data = { ...validMusic, coverUrl: null }
		expect(MusicSchema.parse(data)).toEqual(data)
	})

	it('accepts null trackNumber', () => {
		const data = { ...validMusic, trackNumber: null }
		expect(MusicSchema.parse(data)).toEqual(data)
	})

	it('accepts null year', () => {
		const data = { ...validMusic, year: null }
		expect(MusicSchema.parse(data)).toEqual(data)
	})

	it('rejects missing required fields', () => {
		expect(() => MusicSchema.parse({ id: '1' })).toThrow()
	})

	it('rejects wrong types', () => {
		expect(() => MusicSchema.parse({ ...validMusic, id: 123 })).toThrow()
	})

	it('strips unknown keys', () => {
		const data = { ...validMusic, unknown: 'field' }
		const result = MusicSchema.parse(data)
		expect(result).not.toHaveProperty('unknown')
	})
})

describe('PlaylistSchema', () => {
	const validPlaylist = {
		id: '1',
		name: 'Rock Classics',
		musicIds: ['1', '2'],
		createdAt: '2024-01-15T10:00:00Z',
		updatedAt: '2024-01-15T10:00:00Z',
	}

	it('accepts valid playlist data', () => {
		expect(PlaylistSchema.parse(validPlaylist)).toEqual(validPlaylist)
	})

	it('accepts empty musicIds', () => {
		const data = { ...validPlaylist, musicIds: [] }
		expect(PlaylistSchema.parse(data)).toEqual(data)
	})

	it('rejects missing required fields', () => {
		expect(() => PlaylistSchema.parse({ id: '1' })).toThrow()
	})

	it('rejects non-string dates', () => {
		expect(() =>
			PlaylistSchema.parse({ ...validPlaylist, createdAt: 123 }),
		).toThrow()
	})
})

describe('CreatePlaylistSchema', () => {
	it('accepts valid name', () => {
		expect(CreatePlaylistSchema.parse({ name: 'My Playlist' })).toEqual({
			name: 'My Playlist',
		})
	})

	it('rejects empty name', () => {
		expect(() => CreatePlaylistSchema.parse({ name: '' })).toThrow()
	})

	it('rejects name over 100 chars', () => {
		expect(() =>
			CreatePlaylistSchema.parse({ name: 'a'.repeat(101) }),
		).toThrow()
	})

	it('accepts name at max length', () => {
		expect(CreatePlaylistSchema.parse({ name: 'a'.repeat(100) })).toEqual({
			name: 'a'.repeat(100),
		})
	})
})

describe('ScanResultSchema', () => {
	it('accepts valid scan result', () => {
		const data = { count: 42, message: 'Scan complete' }
		expect(ScanResultSchema.parse(data)).toEqual(data)
	})

	it('rejects missing count', () => {
		expect(() => ScanResultSchema.parse({ message: 'ok' })).toThrow()
	})

	it('rejects missing message', () => {
		expect(() => ScanResultSchema.parse({ count: 1 })).toThrow()
	})
})
