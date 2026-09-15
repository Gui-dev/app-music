# Design: Zod Frontend Schema Validation

## Problem

The `shared/` package has Zod schemas but they have type mismatches with the actual API. The mobile app defines its own TypeScript interfaces and never validates API responses at runtime.

## Goals

1. Fix shared schemas to match actual API response shapes
2. Mobile app imports types from `shared/` instead of hand-written interfaces
3. Runtime validation on all API responses using `z.parse()`

## Changes

### 1. Fix `shared/src/schemas/index.ts`

Current issues:
- `MusicSchema.duration` is `z.number()` (required) — API returns `null`
- `MusicSchema.coverUrl/trackNumber/year` use `.optional()` — API returns `null`
- `PlaylistSchema.createdAt/updatedAt` use `z.date()` — API returns ISO string
- `MusicSchema` missing `filePath` field (server doesn't return it but mobile expects it)

Updated schemas:
```typescript
export const MusicSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number().nullable(),
  coverUrl: z.string().nullable(),
  trackNumber: z.number().nullable(),
  year: z.number().nullable(),
})

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  musicIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreatePlaylistSchema = z.object({
  name: z.string().min(1).max(100),
})

export const ScanResultSchema = z.object({
  count: z.number(),
  message: z.string(),
})
```

### 2. Update `apps/mobile/src/infra/api/music-api.ts`

- Remove hand-written `Music` and `Playlist` interfaces
- Import types and schemas from `@shared/schemas`
- Add `z.parse()` validation on every API response
- Use `z.infer` types instead of manual interfaces

### 3. Add `@shared/*` path alias to mobile tsconfig

Already configured in `tsconfig.json`:
```json
"paths": { "@shared/*": ["../../shared/src/*"] }
```

### 4. Tests

- Unit tests for each schema (valid data, missing fields, null values, wrong types)
- Tests for API client validation (mock axios responses, verify parse behavior)

## Files to modify

- `shared/src/schemas/index.ts` — fix schemas
- `shared/src/index.ts` — export ScanResultSchema
- `apps/mobile/src/infra/api/music-api.ts` — use shared schemas + runtime validation
- `shared/src/schemas/index.spec.ts` — schema tests (new)
- `apps/mobile/src/infra/api/music-api.spec.ts` — API validation tests (new)

## Out of scope

- Server-side changes (server uses Zod v4, not changing that)
- Changing shared package Zod version (stays v3)
