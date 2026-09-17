import { afterEach, describe, expect, it, vi } from 'vitest'
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
	afterEach(() => {
		delete process.env.MUSIC_PATH
	})

	it('should scan directory and save musics to repository', async () => {
		process.env.MUSIC_PATH = '/music'
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([
				createTestMusic({ id: '1', title: 'Song 1' }),
				createTestMusic({ id: '2', title: 'Song 2' }),
			]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		const result = await useCase.execute()

		expect(mockScanner.scanDirectory).toHaveBeenCalledWith('/music')
		expect(result.count).toBe(2)
		expect(result.message).toBe('Found 2 music files')

		const saved = await repo.findAll()
		expect(saved).toHaveLength(2)
	})

	it('should use MUSIC_PATH env var', async () => {
		process.env.MUSIC_PATH = '/custom/path'
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await useCase.execute()

		expect(mockScanner.scanDirectory).toHaveBeenCalledWith('/custom/path')
	})

	it('should throw when MUSIC_PATH is not configured', async () => {
		delete process.env.MUSIC_PATH
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn(),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await expect(useCase.execute()).rejects.toThrow(
			'MUSIC_PATH environment variable is not configured',
		)
		expect(mockScanner.scanDirectory).not.toHaveBeenCalled()
	})

	it('should return count 0 when no files found', async () => {
		process.env.MUSIC_PATH = '/empty'
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockResolvedValue([]),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		const result = await useCase.execute()

		expect(result.count).toBe(0)
		expect(result.message).toBe('Found 0 music files')
	})

	it('should propagate scanner errors', async () => {
		process.env.MUSIC_PATH = '/noaccess'
		const repo = new InMemoryMusicRepository()
		const mockScanner = {
			scanDirectory: vi.fn().mockRejectedValue(new Error('Permission denied')),
		}
		const useCase = new ScanMusicLibrary(mockScanner, repo)

		await expect(useCase.execute()).rejects.toThrow('Permission denied')
	})
})
