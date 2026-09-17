import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { IScannerService } from '@/domain/contracts/services/i-scanner-service'

export interface ScanMusicLibraryInput {
	path?: string
}

export interface ScanMusicLibraryOutput {
	count: number
	message: string
}

export class ScanMusicLibrary {
	constructor(
		private readonly scannerService: IScannerService,
		private readonly musicRepository: IMusicRepository,
	) {}

	async execute(input: ScanMusicLibraryInput): Promise<ScanMusicLibraryOutput> {
		const scanPath = input.path || process.env.MUSIC_PATH || '/music'

		const musics = await this.scannerService.scanDirectory(scanPath)
		await this.musicRepository.saveMany(musics)

		return {
			count: musics.length,
			message: `Found ${musics.length} music files`,
		}
	}
}
