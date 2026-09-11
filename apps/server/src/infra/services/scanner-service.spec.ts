import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('music-metadata', () => ({
	parseFile: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
	readdir: vi.fn(),
}))

let readdir: ReturnType<typeof vi.fn>
let parseFile: ReturnType<typeof vi.fn>
let ScannerService: typeof import('./scanner-service').ScannerService

beforeAll(async () => {
	const fs = await import('node:fs/promises')
	readdir = fs.readdir as unknown as ReturnType<typeof vi.fn>

	const mm = await import('music-metadata')
	parseFile = mm.parseFile as unknown as ReturnType<typeof vi.fn>

	const mod = await import('./scanner-service')
	ScannerService = mod.ScannerService
})

describe('ScannerService', () => {
	let scanner: InstanceType<typeof ScannerService>

	beforeEach(() => {
		scanner = new ScannerService()
		vi.clearAllMocks()
	})

	it('should scan directory and return music files', async () => {
		vi.mocked(readdir).mockResolvedValueOnce([
			{ name: 'song.mp3', isFile: () => true, isDirectory: () => false },
		] as any)

		vi.mocked(parseFile).mockResolvedValueOnce({
			common: {
				title: 'Test Song',
				artist: 'Test Artist',
				album: 'Test Album',
				track: { no: 1 },
				year: 2024,
			},
			format: { duration: 180 },
		} as any)

		const result = await scanner.scanDirectory('/music')

		expect(result).toHaveLength(1)
		expect(result[0].title).toBe('Test Song')
		expect(result[0].artist).toBe('Test Artist')
	})

	it('should handle empty directories', async () => {
		vi.mocked(readdir).mockResolvedValueOnce([])

		const result = await scanner.scanDirectory('/music')

		expect(result).toHaveLength(0)
	})

	it('should skip non-audio files', async () => {
		vi.mocked(readdir).mockResolvedValueOnce([
			{ name: 'readme.txt', isFile: () => true, isDirectory: () => false },
			{ name: 'image.jpg', isFile: () => true, isDirectory: () => false },
		] as any)

		const result = await scanner.scanDirectory('/music')

		expect(result).toHaveLength(0)
	})

	it('should handle parse errors gracefully', async () => {
		vi.mocked(readdir).mockResolvedValueOnce([
			{ name: 'corrupted.mp3', isFile: () => true, isDirectory: () => false },
		] as any)

		vi.mocked(parseFile).mockRejectedValueOnce(new Error('Parse error'))

		const result = await scanner.scanDirectory('/music')

		expect(result).toHaveLength(0)
	})

	it('should scan subdirectories recursively', async () => {
		vi.mocked(readdir)
			.mockResolvedValueOnce([
				{ name: 'subfolder', isFile: () => false, isDirectory: () => true },
			] as any)
			.mockResolvedValueOnce([
				{ name: 'nested.mp3', isFile: () => true, isDirectory: () => false },
			] as any)

		vi.mocked(parseFile).mockResolvedValueOnce({
			common: {
				title: 'Nested Song',
				artist: 'Nested Artist',
				album: 'Nested Album',
				track: { no: 1 },
				year: 2024,
			},
			format: { duration: 200 },
		} as any)

		const result = await scanner.scanDirectory('/music')

		expect(result).toHaveLength(1)
		expect(result[0].title).toBe('Nested Song')
	})
})
