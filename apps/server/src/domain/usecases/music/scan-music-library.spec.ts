import { describe, expect, it, vi } from 'vitest'
import type { Music } from '@/domain/entities'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import { ScanMusicLibrary } from './scan-music-library'

function createTestMusic(overrides: Partial<Music> = {}): Music {
	return {
		id: '1',
		title: 'Test Song',
		artist: 'Test Artist',
		album: 'Test Album',
		duration: 180,
		filePath: '/path/to/song.mp3',
		coverUrl: null,
		trackNumber: 1,
		year: 2024,
		...overrides,
	}
}

describe('ScanMusicLibrary', () => {
	it('should scan directory and save musics to repository', async () => {
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([
				createTestMusic({ id: '1', title: 'Song 1' }),
				createTestMusic({ id: '2', title: 'Song 2' }),
			]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		const result = await useCase.execute({ path: '/music' })

		expect(mockScanner.scanDirectory).toHaveBeenCalledWith('/music')
		expect(result.count).toBe(2)
		expect(result.message).toBe('Found 2 music files')

		const saved = await repo.findAll()
		expect(saved).toHaveLength(2)
	})

	it('should use default path when none provided', async () => {
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await useCase.execute({})

		expect(mockScanner.scanDirectory).toHaveBeenCalledWith('/music')
	})

	it('should use MUSIC_PATH env var when no path provided', async () => {
		const original = process.env.MUSIC_PATH
		process.env.MUSIC_PATH = '/custom/path'

		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await useCase.execute({})

		expect(mockScanner.scanDirectory).toHaveBeenCalledWith('/custom/path')

		process.env.MUSIC_PATH = original
	})

	it('should return count 0 when no files found', async () => {
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		const result = await useCase.execute({ path: '/empty' })

		expect(result.count).toBe(0)
		expect(result.message).toBe('Found 0 music files')
	})

	it('should propagate scanner errors', async () => {
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockRejectedValue(new Error('Permission denied')),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await expect(useCase.execute({ path: '/noaccess' })).rejects.toThrow(
			'Permission denied',
		)
	})
})
