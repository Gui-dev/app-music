import type { Readable } from 'node:stream'

export interface FileStream {
  stream: Readable
  contentType: string
  totalSize: number
}

export interface IFileStorage {
  getStream(filePath: string, start?: number, end?: number): Promise<FileStream>
  getFileInfo(filePath: string): Promise<{ size: number; contentType: string }>
}
