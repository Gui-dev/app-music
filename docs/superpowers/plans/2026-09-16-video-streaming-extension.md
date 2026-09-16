# Video Streaming Extension Plan

> **For agentic workers:** This plan extends the existing music streaming app to also serve movies and TV shows from DVDs. NOT being executed now.

**Goal:** Extend the existing monorepo to support video streaming (movies + TV shows) alongside music, using the same server and mobile app.

**Architecture:** Add `Video` entity alongside `Music`. Server serves both. Mobile app adds a "Vídeos" tab with Movies and TV Shows sections.

**Tech Stack:** Same stack — Fastify, SQLite/Drizzle, React Native/Expo, expo-video (new)

---

## Architecture Overview

```
app-music (renamed to app-media internally)
├── apps/server/
│   ├── src/domain/entities/
│   │   ├── music.ts          (existing)
│   │   ├── playlist.ts       (existing)
│   │   └── video.ts          (NEW)
│   ├── src/domain/usecases/
│   │   ├── music/            (existing)
│   │   ├── playlist/         (existing)
│   │   └── video/            (NEW)
│   └── src/infra/http/routes/
│       ├── music-routes.ts   (existing)
│       ├── playlist-routes.ts (existing)
│       └── video-routes.ts   (NEW)
├── apps/mobile/
│   ├── src/screens/
│   │   ├── player-screen.tsx     (existing — music)
│   │   ├── video-player-screen.tsx (NEW)
│   │   ├── movies-screen.tsx     (NEW)
│   │   └── tvshows-screen.tsx    (NEW)
│   └── src/presentation/components/
│       ├── music-card.tsx        (existing)
│       ├── video-card.tsx        (NEW)
│       └── episode-card.tsx      (NEW)
└── shared/
    └── src/schemas/
        ├── index.ts              (existing — music schemas)
        └── video.ts              (NEW)
```

---

## DVD Workflow (Manual — Outside the App)

1. **Rip DVD** using MakeMKV or HandBrake → `.mkv` or `.mp4` files
2. **Organize files:**
   ```
   /mnt/media/
   ├── Music/
   │   ├── Artist/
   │   │   └── Album/
   │   │       └── track.mp3
   ├── Movies/
   │   ├── Inception (2010)/
   │   │   └── Inception.mkv
   │   └── The Matrix (1999)/
   │       └── The Matrix.mkv
   └── TV Shows/
       ├── Breaking Bad/
       │   ├── Season 1/
       │   │   ├── S01E01.mkv
       │   │   └── S01E02.mkv
       │   └── Season 2/
       │       └── S02E01.mkv
       └── The Office/
           └── Season 1/
               └── S01E01.mkv
   ```
3. **Scan from app:** POST `/scan` with `{ "path": "/mnt/media" }`

---

## Phase 1: Server — Video Entity

### Task 1: Add Video Schema (shared)

**Files:**
- Create: `shared/src/schemas/video.ts`
- Modify: `shared/src/schemas/index.ts`

```typescript
// shared/src/schemas/video.ts
import { z } from 'zod'

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['movie', 'tvshow']),
  // For movies:
  year: z.number().nullable(),
  duration: z.number().nullable(),
  // For TV shows:
  series: z.string().nullable(),
  season: z.number().nullable(),
  episode: z.number().nullable(),
  // Common:
  filePath: z.string(),
  coverUrl: z.string().nullable(),
  backdropUrl: z.string().nullable(),
})

export type Video = z.infer<typeof VideoSchema>

export const VideoListSchema = z.array(VideoSchema)
```

### Task 2: Add Video Table (server database)

**Files:**
- Modify: `apps/server/src/infra/database/database.ts`

Add table:
```sql
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('movie', 'tvshow')),
  year INTEGER,
  duration INTEGER,
  series TEXT,
  season INTEGER,
  episode INTEGER,
  file_path TEXT NOT NULL,
  cover_url TEXT,
  backdrop_url TEXT
);
```

### Task 3: Add Video Repository

**Files:**
- Create: `apps/server/src/domain/contracts/repositories/i-video-repository.ts`
- Create: `apps/server/src/infra/repositories/video-repository.ts`
- Create: `apps/server/src/infra/repositories/in-memory/in-memory-video-repository.ts`
- Create: `apps/server/src/infra/repositories/video-repository.spec.ts`

Repository interface:
```typescript
interface IVideoRepository {
  findAll(): Promise<Video[]>
  findById(id: string): Promise<Video | null>
  search(query: string): Promise<Video[]>
  findByType(type: 'movie' | 'tvshow'): Promise<Video[]>
  findBySeries(series: string): Promise<Video[]>
  save(video: Video): Promise<void>
  saveMany(videos: Video[]): Promise<void>
  delete(id: string): Promise<void>
}
```

### Task 4: Add Video Use Cases

**Files:**
- Create: `apps/server/src/domain/usecases/video/list-videos.ts`
- Create: `apps/server/src/domain/usecases/video/search-videos.ts`
- Create: `apps/server/src/domain/usecases/video/list-movies.ts`
- Create: `apps/server/src/domain/usecases/video/list-tvshows.ts`
- Create: `apps/server/src/domain/usecases/video/get-video.ts`
- All with corresponding `.spec.ts` files

### Task 5: Add Video Routes

**Files:**
- Create: `apps/server/src/infra/http/routes/video-routes.ts`

Routes:
```
GET    /videos              — List all videos
GET    /videos/:id          — Get video by ID
GET    /videos/movies       — List only movies
GET    /videos/tvshows      — List TV shows (grouped by series)
GET    /videos/tvshows/:series — List episodes for a series
GET    /search/video?q=     — Search videos
GET    /stream/video/:id    — Stream video file (with Range support)
POST   /scan/video          — Scan directory for video files
```

### Task 6: Extend ScannerService for Video

**Files:**
- Modify: `apps/server/src/infra/services/scanner-service.ts`

Add video scanning alongside music scanning. Parse metadata from filenames:
- Movies: `Movies/Inception (2010)/Inception.mkv` → title, year
- TV Shows: `TV Shows/Breaking Bad/Season 1/S01E05.mkv` → series, season, episode

Supported formats: `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`

### Task 7: Extend Container

**Files:**
- Modify: `apps/server/src/infra/container/index.ts`

Add `videoRepository`, `listVideos`, `searchVideos`, `listMovies`, `listTvshows`, `getVideo`, `streamVideo`.

---

## Phase 2: Mobile — Video Screens

### Task 8: Install expo-video

```bash
cd apps/mobile
pnpm add expo-video
```

### Task 9: Create Video Card Component

**Files:**
- Create: `apps/mobile/src/presentation/components/video-card.tsx`
- Create: `apps/mobile/src/presentation/components/video-card.spec.tsx`

Displays video thumbnail, title, year/duration. For TV shows: series, season, episode.

### Task 10: Create Movies Screen

**Files:**
- Create: `apps/mobile/src/screens/movies-screen.tsx`
- Create: `apps/mobile/src/screens/movies-screen.spec.tsx`

- FlatList of movies
- Search bar
- Tap → opens video player

### Task 11: Create TV Shows Screen

**Files:**
- Create: `apps/mobile/src/screens/tvshows-screen.tsx`
- Create: `apps/mobile/src/screens/tvshows-screen.spec.tsx`

- Two-level navigation: Series list → Episode list
- Series card shows cover + number of episodes
- Episode card shows S01E05 + title + duration

### Task 12: Create Video Player Screen

**Files:**
- Create: `apps/mobile/src/screens/video-player-screen.tsx`
- Create: `apps/mobile/src/screens/video-player-screen.spec.tsx`

Uses `expo-video` for playback. Shows:
- Video player (fullscreen capable)
- Title, series info
- Controls: play/pause, seek, fullscreen
- Episode navigation (prev/next for TV shows)

### Task 13: Add Video API Methods

**Files:**
- Modify: `apps/mobile/src/infra/api/music-api.ts` (rename to `media-api.ts`)

Add methods:
```typescript
// Videos
listVideos(): Promise<Video[]>
getVideo(id: string): Promise<Video>
listMovies(): Promise<Video[]>
listTvShows(): Promise<Video[]>
getTvShowEpisodes(series: string): Promise<Video[]>
searchVideos(query: string): Promise<Video[]>
getVideoStreamUrl(id: string): string
```

### Task 14: Add TanStack Query Hooks for Videos

**Files:**
- Create: `apps/mobile/src/hooks/queries/use-videos.ts`
- Create: `apps/mobile/src/hooks/queries/use-videos.spec.tsx`

### Task 15: Update Navigation

**Files:**
- Modify: `apps/mobile/src/presentation/components/bottom-nav.tsx`

Add tabs:
```
Player  |  Search  |  Biblioteca  |  Vídeos  |  Playlists
```

The "Vídeos" tab opens a sub-navigation: Movies / TV Shows.

### Task 16: Wire Video Screens into AppContent

**Files:**
- Modify: `apps/mobile/src/app-content.tsx`

Add video state, screen routing, and screen components.

---

## Phase 3: Video Playback

### Task 17: Implement Video Player Service

**Files:**
- Create: `apps/mobile/src/audio/video-player.ts` (or `video/`)

Wraps `expo-video` similar to how `audio-player.ts` wraps `expo-audio`:
- load, play, pause, seek
- Fullscreen toggle
- Subtitle support (if embedded in MKV)

### Task 18: Implement useVideoPlayer Hook

**Files:**
- Create: `apps/mobile/src/hooks/use-video-player.ts`

Similar to `usePlayer` but for video.

---

## Phase 4: Polish

### Task 19: Movie Metadata

For richer metadata, optionally fetch from TMDB API:
- Poster images
- Backdrop images
- Synopsis
- Rating

### Task 20: Watch Progress

Track viewing progress per video:
```sql
CREATE TABLE IF NOT EXISTS watch_progress (
  video_id TEXT PRIMARY KEY,
  position_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Task 21: Subtitle Support

If MKV files contain embedded subtitles, expose them via the API and render in expo-video.

---

## Quick Reference

| Item | Value |
|------|-------|
| Video path | `/mnt/media/Movies` and `/mnt/media/TV Shows` |
| Database | Same SQLite DB, new `videos` table |
| Server routes | `/videos/*`, `/stream/video/*`, `/scan/video` |
| Mobile tab | "Vídeos" with Movies/TV Shows sub-screens |
| Player | expo-video (fullscreen capable) |

---

## File Changes Summary

| Action | Files |
|--------|-------|
| Create | `shared/src/schemas/video.ts` |
| Create | `apps/server/src/domain/contracts/repositories/i-video-repository.ts` |
| Create | `apps/server/src/infra/repositories/video-repository.ts` |
| Create | `apps/server/src/infra/repositories/in-memory/in-memory-video-repository.ts` |
| Create | `apps/server/src/infra/http/routes/video-routes.ts` |
| Create | `apps/server/src/domain/usecases/video/*.ts` (5 use cases + 5 specs) |
| Modify | `apps/server/src/infra/database/database.ts` |
| Modify | `apps/server/src/infra/services/scanner-service.ts` |
| Modify | `apps/server/src/infra/container/index.ts` |
| Modify | `apps/server/src/server.ts` |
| Create | `apps/mobile/src/presentation/components/video-card.tsx` |
| Create | `apps/mobile/src/screens/movies-screen.tsx` |
| Create | `apps/mobile/src/screens/tvshows-screen.tsx` |
| Create | `apps/mobile/src/screens/video-player-screen.tsx` |
| Create | `apps/mobile/src/hooks/queries/use-videos.ts` |
| Create | `apps/mobile/src/hooks/use-video-player.ts` |
| Modify | `apps/mobile/src/infra/api/music-api.ts` |
| Modify | `apps/mobile/src/presentation/components/bottom-nav.tsx` |
| Modify | `apps/mobile/src/app-content.tsx` |
