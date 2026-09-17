import { readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { extname, join } from 'node:path'
import { parseFile } from 'music-metadata'
import type { IScannerService } from '@/domain/contracts/services/i-scanner-service'
import type { Music } from '@/domain/entities'

console.log('ScannerService loaded, music-metadata:', typeof parseFile)

const AUDIO_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac']

export class ScannerService implements IScannerService {
	async scanDirectory(rootPath: string): Promise<Music[]> {
		console.log('scanDirectory called with:', rootPath)
		const musics: Music[] = []
		await this.scanRecursive(rootPath, musics)
		console.log('scanDirectory done, found:', musics.length)
		return musics
	}

	private async scanRecursive(dirPath: string, musics: Music[]): Promise<void> {
		console.log('scanRecursive:', dirPath)
		let entries
		try {
			entries = await readdir(dirPath, { withFileTypes: true })
		} catch (error: any) {
			console.error('readdir error:', dirPath, error.message)
			return
		}

		for (const entry of entries) {
			const fullPath = join(dirPath, entry.name)

			if (entry.isDirectory()) {
				await this.scanRecursive(fullPath, musics)
				continue
			}

			if (entry.isFile() && this.isAudioFile(entry.name)) {
				const music = await this.parseAudioFile(fullPath)
				if (music) {
					musics.push(music)
				}
			}
		}
	}

	private isAudioFile(filename: string): boolean {
		const ext = extname(filename).toLowerCase()
		return AUDIO_EXTENSIONS.includes(ext)
	}

	private generateId(filePath: string): string {
		return createHash('sha256').update(filePath).digest('hex').slice(0, 16)
	}

	private async parseAudioFile(filePath: string): Promise<Music | null> {
		try {
			console.log('Parsing:', filePath)
			const metadata = await parseFile(filePath)
			console.log('Parsed:', metadata.common.title)
			const common = metadata.common
			const format = metadata.format

			return {
				id: this.generateId(filePath),
				title: common.title || 'Unknown Title',
				artist: common.artist || 'Unknown Artist',
				album: common.album || 'Unknown Album',
				duration: format.duration || 0,
				filePath,
				coverUrl: null,
				trackNumber: common.track?.no || null,
				year: common.year || null,
			}
		} catch (error: any) {
			console.error('parseFile error:', error.message, error.stack)
			return null
		}
	}
}
