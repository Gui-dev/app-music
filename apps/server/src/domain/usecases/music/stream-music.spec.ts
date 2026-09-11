import { describe, it, expect } from 'vitest'
import { StreamMusic } from './stream-music'
import { InMemoryMusicRepository } from '@/infra/repositories/in-memory/in-memory-music-repository'
import type { Music } from '@/domain/entities'
import type { IFileStorage, FileStream } from '@/domain/contracts/services/i-file-storage'
import { DomainError } from '@/domain/errors/domain-error'
import { Readable } from 'node:stream'

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

function createMockFileStorage(): IFileStorage {
  const mockStream = Readable.from(Buffer.from('test audio data'))

  return {
    async getStream(): Promise<FileStream> {
      return {
        stream: mockStream,
        contentType: 'audio/mpeg',
        totalSize: 1024,
      }
    },
    async getFileInfo() {
      return { size: 1024, contentType: 'audio/mpeg' }
    },
  }
}

describe('StreamMusic', () => {
  it('should stream a music file', async () => {
    const repo = new InMemoryMusicRepository()
    const fileStorage = createMockFileStorage()
    const useCase = new StreamMusic(repo, fileStorage)

    await repo.save(createTestMusic({ id: '1' }))

    const result = await useCase.execute({ musicId: '1' })

    expect(result.music.id).toBe('1')
    expect(result.stream.contentType).toBe('audio/mpeg')
    expect(result.totalSize).toBe(1024)
    expect(result.start).toBe(0)
    expect(result.end).toBe(1023)
  })

  it('should throw DomainError for non-existent music', async () => {
    const repo = new InMemoryMusicRepository()
    const fileStorage = createMockFileStorage()
    const useCase = new StreamMusic(repo, fileStorage)

    await expect(useCase.execute({ musicId: 'non-existent' }))
      .rejects.toThrow(DomainError)
  })

  it('should parse range header correctly', async () => {
    const repo = new InMemoryMusicRepository()
    const fileStorage = createMockFileStorage()
    const useCase = new StreamMusic(repo, fileStorage)

    await repo.save(createTestMusic({ id: '1' }))

    const result = await useCase.execute({ musicId: '1', range: 'bytes=0-499' })

    expect(result.start).toBe(0)
    expect(result.end).toBe(499)
  })

  it('should handle range without end', async () => {
    const repo = new InMemoryMusicRepository()
    const fileStorage = createMockFileStorage()
    const useCase = new StreamMusic(repo, fileStorage)

    await repo.save(createTestMusic({ id: '1' }))

    const result = await useCase.execute({ musicId: '1', range: 'bytes=500-' })

    expect(result.start).toBe(500)
    expect(result.end).toBe(1023)
  })
})
