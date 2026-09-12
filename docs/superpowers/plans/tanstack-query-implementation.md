# TanStack Query Implementation Plan

## Overview
Migrate from custom hooks (`usePlayer`, `usePlaylist`) to TanStack Query v5 for data fetching, caching, and mutations.

## Dependencies to Install
```bash
cd apps/mobile
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Implementation Steps

### 1. Setup QueryClient and Provider
**File**: `src/providers/query-provider.tsx`
- Create `QueryClient` with default config
- Wrap app with `QueryClientProvider`
- Add `ReactQueryDevtools` (development only)

### 2. Create Query Hooks (Replace Custom Hooks)
**File**: `src/hooks/queries/use-musics.ts`
- `useMusics()` - fetch all musics (replaces `usePlaylist` list)
- `useMusic(id)` - fetch single music
- `useSearchMusics(query)` - search with debounce

**File**: `src/hooks/queries/use-playlists.ts`
- `usePlaylists()` - fetch all playlists
- `usePlaylist(id)` - fetch playlist with musics

### 3. Create Mutation Hooks
**File**: `src/hooks/mutations/use-playlist-mutations.ts`
- `useCreatePlaylist()` - POST `/playlists`
- `useAddMusicToPlaylist()` - POST `/playlists/:id/add`
- `useRemoveMusicFromPlaylist()` - DELETE `/playlists/:id/remove/:musicId`
- `useDeletePlaylist()` - DELETE `/playlists/:id`

### 4. Update Components to Use New Hooks
- `HomeScreen` → `useMusics()`
- `SearchScreen` → `useSearchMusics(query)`
- `PlaylistsScreen` → `usePlaylists()` + mutations
- `PlayerScreen` → `useMusic(id)` for metadata

### 5. Configure Query Keys and Defaults
- `['musics']` - all musics
- `['musics', id]` - single music
- `['musics', 'search', query]` - search results
- `['playlists']` - all playlists
- `['playlists', id]` - single playlist
- Default `staleTime: 5 * 60 * 1000` (5 min)
- Default `retry: 1`

### 6. DevTools (Dev Only)
- Conditional render in `QueryProvider`

### 7. Testing
- Mock `QueryClient` in tests
- Test cache behavior
- Test invalidation on mutations

## File Structure After
```
src/
├── providers/
│   └── query-provider.tsx
├── hooks/
│   ├── queries/
│   │   ├── use-musics.ts
│   │   └── use-playlists.ts
│   └── mutations/
│       └── use-playlist-mutations.ts
└── infra/api/
    └── music-api.ts (existing)
```

## Migration Checklist
- [ ] Install dependencies
- [ ] Create QueryClient/Provider
- [ ] Create query hooks
- [ ] Create mutation hooks
- [ ] Update HomeScreen
- [ ] Update SearchScreen
- [ ] Update PlaylistsScreen
- [ ] Update PlayerScreen
- [ ] Add DevTools
- [ ] Remove old usePlayer/usePlaylist hooks
- [ ] Update tests
- [ ] Run typecheck
- [ ] Run tests