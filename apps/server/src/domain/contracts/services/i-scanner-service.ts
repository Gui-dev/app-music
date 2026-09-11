import type { Music } from '@/domain/entities'

export interface IScannerService {
	scanDirectory(rootPath: string): Promise<Music[]>
}
