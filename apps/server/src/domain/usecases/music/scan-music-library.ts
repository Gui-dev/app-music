import type { IMusicRepository } from '@/domain/contracts/repositories/i-music-repository'
import type { IScannerService } from '@/domain/contracts/services/i-scanner-service'
import { DomainError } from '@/domain/errors/domain-error'

export interface ScanMusicLibraryOutput {
	count: number
	message: string
}

export class ScanMusicLibrary {
	constructor(
		private readonly scannerService: IScannerService,
		private readonly musicRepository: IMusicRepository,
	) {}

	async execute(): Promise<ScanMusicLibraryOutput> {
		const scanPath = process.env.MUSIC_PATH

		if (!scanPath) {
			throw new DomainError(
				'MUSIC_PATH_NOT_CONFIGURED',
				'MUSIC_PATH environment variable is not configured',
				500,
			)
		}

		const musics = await this.scannerService.scanDirectory(scanPath)
		await this.musicRepository.saveMany(musics)

		return {
			count: musics.length,
			message: `Found ${musics.length} music files`,
		}
	}
}
