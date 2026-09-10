import { z } from 'zod';

export const MusicSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  filePath: z.string(),
  coverUrl: z.string().optional(),
  trackNumber: z.number().optional(),
  year: z.number().optional(),
});

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  musicIds: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(100),
});

export type Music = z.infer<typeof MusicSchema>;
export type Playlist = z.infer<typeof PlaylistSchema>;
export type CreatePlaylistInput = z.infer<typeof CreatePlaylistSchema>;
