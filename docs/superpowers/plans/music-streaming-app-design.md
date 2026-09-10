# Music Streaming App - Design Document

## Overview

Aplicativo Android de streaming de música pessoal, que acessa uma biblioteca de MP3s armazenados em HD externo conectado a um PC, permitindo ouvir de qualquer lugar via streaming.

## Goals

- Streaming de áudio sem download
- Playlists personalizadas
- Busca automática de capas de álbum
- Player completo com controles avançados (equalizador, velocidade)
- App Android via React Native (Expo)
- Backend Fastify com Clean Architecture

## Non-Goals (por enquanto)

- Multiusuário/autenticação
- Download para offline
- iOS

---

## Monorepo Structure

```
app-music/
├── apps/
│   ├── server/          # Fastify backend
│   └── mobile/          # React Native app
├── shared/
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── skills/
├── AGENTS.md
└── pnpm-workspace.yaml
```

## Design System

### Color Palette

| Token | Value | Hex | Uso |
|-------|-------|-----|-----|
| `--color-bg` | Background | `#0D0D0D` | Tela principal |
| `--color-surface` | Surface/Card | `#262330` | Cards, containers |
| `--color-surface-hover` | Surface hover | `#302D3B` | Elementos interativos |
| `--color-primary` | Accent principal | `#FACC16` | CTA, botões, estados ativos |
| `--color-text-primary` | Texto primário | `#FFFFFF` | Títulos, conteúdo principal |
| `--color-text-secondary` | Texto secundário | `#404047` | Subtítulos, metadados |
| `--color-border` | Bordas | `#262330` | Divisores, bordas de cards |

**Tema:** Dark mode, purple-tinted surfaces com acento gold/yellow.

### Layout Base

- **Mobile-first**: Interface otimizada para dispositivos Android
- **Header/Topbar**: Área superior com navegação e título
- **Content Zone**: Área principal para listas, álbuns, buscas
- **Album Art Display**: Zona central destacada para capas de álbuns
- **Player Controls**: Barra inferior com controles de reprodução
- **Purple-tinted surfaces**: Cards e containers com fundo escuro com tom púrpura
- **Gold/Yellow accent**: Cores de ação primária (botões, estados ativos)

---

## Architecture

### Overview

```
┌─────────────────────┐         ┌─────────────────────────┐
│   React Native App  │  HTTP   │   Fastify Server (PC)   │
│      (Expo)         │◄───────►│                         │
│                     │         │  - Streaming de áudio   │
│  - Player           │         │  - Playlists (SQLite)   │
│  - Playlists        │         │  - Capas (Last.fm API)  │
│  - Busca            │         │  - Metadados            │
│  - Equalizer        │         │  - HD Externo montado   │
└─────────────────────┘         └─────────────────────────┘
```

**Fluxo:** App solicita música → Fastify lê do HD → Stream volta via HTTP → App reproduz

### Package Management
- **pnpm workspaces** gerencia dependências do monorepo
- Root `pnpm-workspace.yaml` define os pacotes `apps/server/` e `apps/mobile/`

### Shared Tools (Monorepo)
- **Zod** — Validação de schemas compartilhada entre frontend e backend
- **Biome** — Linting e formatação unificados para todo o monorepo
- **pnpm** — Package manager com workspaces

---

## Backend

### Tech Stack

| Tecnologia | Uso |
|-----------|-----|
| Fastify | Servidor HTTP |
| @fastify/zod | Validação de schemas no backend |
| Zod | Validação de schemas |
| better-sqlite3 | Banco SQLite |
| music-metadata | Ler tags ID3 dos MP3s |
| vitest | Testes unitários/integration |
| supertest | Testes de rotas HTTP |
| tsx | Execução TypeScript |
| Biome | Linting e formatação |

### Project Structure (Clean Architecture)

```
apps/server/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Music.ts
│   │   │   └── Playlist.ts
│   │   ├── contracts/
│   │   │   ├── repositories/
│   │   │   │   ├── IMusicRepository.ts
│   │   │   │   └── IPlaylistRepository.ts
│   │   │   └── services/
│   │   │       ├── ICoverService.ts
│   │   │       └── IScannerService.ts
│   │   └── usecases/
│   │       ├── music/
│   │       │   ├── ListMusics.ts
│   │       │   ├── ListMusics.test.ts
│   │       │   ├── StreamMusic.ts
│   │       │   ├── StreamMusic.test.ts
│   │       │   ├── SearchMusics.ts
│   │       │   └── SearchMusics.test.ts
│   │       └── playlist/
│   │           ├── CreatePlaylist.ts
│   │           ├── CreatePlaylist.test.ts
│   │           ├── AddMusicToPlaylist.ts
│   │           ├── AddMusicToPlaylist.test.ts
│   │           ├── ListPlaylists.ts
│   │           ├── ListPlaylists.test.ts
│   │           ├── RemoveMusicFromPlaylist.ts
│   │           └── RemoveMusicFromPlaylist.test.ts
│   ├── infra/
│   │   ├── repositories/
│   │   │   ├── MusicRepository.ts
│   │   │   ├── MusicRepository.test.ts
│   │   │   ├── PlaylistRepository.ts
│   │   │   └── PlaylistRepository.test.ts
│   │   ├── services/
│   │   │   ├── CoverService.ts
│   │   │   ├── CoverService.test.ts
│   │   │   ├── ScannerService.ts
│   │   │   └── ScannerService.test.ts
│   │   └── database/
│   │       └── SQLite.ts
│   ├── presentation/
│   │   ├── routes/
│   │   │   ├── music.routes.ts
│   │   │   ├── music.routes.test.ts
│   │   │   ├── playlist.routes.ts
│   │   │   ├── playlist.routes.test.ts
│   │   │   ├── search.routes.ts
│   │   │   └── search.routes.test.ts
│   │   └── controllers/
│   │       ├── MusicController.ts
│   │       ├── MusicController.test.ts
│   │       ├── PlaylistController.ts
│   │       └── PlaylistController.test.ts
│   └── server.ts
├── tests/
│   └── e2e/
│       └── full-flow.test.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### Entities

**Music**
```typescript
interface Music {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;        // seconds
  filePath: string;        // relative to HD root
  coverUrl?: string;       // cached cover URL
  trackNumber?: number;
  year?: number;
}
```

**Playlist**
```typescript
interface Playlist {
  id: string;
  name: string;
  musicIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Contracts (Interfaces)

**IMusicRepository**
```typescript
interface IMusicRepository {
  findAll(): Promise<Music[]>;
  findById(id: string): Promise<Music | null>;
  search(query: string): Promise<Music[]>;
  findByAlbum(album: string): Promise<Music[]>;
  findByArtist(artist: string): Promise<Music[]>;
  save(music: Music): Promise<void>;
  saveMany(musics: Music[]): Promise<void>;
}
```

**IPlaylistRepository**
```typescript
interface IPlaylistRepository {
  findAll(): Promise<Playlist[]>;
  findById(id: string): Promise<Playlist | null>;
  create(name: string): Promise<Playlist>;
  addMusic(playlistId: string, musicId: string): Promise<void>;
  removeMusic(playlistId: string, musicId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**ICoverService**
```typescript
interface ICoverService {
  getCover(artist: string, album: string): Promise<string | null>;
}
```

**IScannerService**
```typescript
interface IScannerService {
  scanDirectory(rootPath: string): Promise<Music[]>;
}
```

### Use Cases

**ListMusics**
- Input: none
- Output: Music[]
- Logic: Fetch all musics from repository

**StreamMusic**
- Input: musicId
- Output: ReadableStream
- Logic: Find music by ID, read file from HD, return stream with proper HTTP Range support

**SearchMusics**
- Input: query string
- Output: Music[]
- Logic: Search by title, artist, or album name

**CreatePlaylist**
- Input: name
- Output: Playlist
- Logic: Create new playlist with empty music list

**AddMusicToPlaylist**
- Input: playlistId, musicId
- Output: void
- Logic: Add music to playlist, update timestamps

**ListPlaylists**
- Input: none
- Output: Playlist[]
- Logic: Fetch all playlists

### API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/music` | Lista todas as músicas |
| GET | `/music/:id` | Detalhes de uma música |
| GET | `/stream/:id` | Stream do áudio (HTTP Range para seek) |
| GET | `/cover/:id` | Capa do álbum |
| GET | `/search?q=` | Busca por nome, artista, álbum |
| POST | `/playlists` | Cria playlist |
| GET | `/playlists` | Lista playlists |
| POST | `/playlists/:id/add` | Adiciona música à playlist |
| DELETE | `/playlists/:id/remove/:musicId` | Remove música da playlist |
| POST | `/scan` | Re-escaneia HD |

### Database Schema (SQLite)

```sql
CREATE TABLE musics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  duration INTEGER,
  file_path TEXT NOT NULL,
  cover_url TEXT,
  track_number INTEGER,
  year INTEGER
);

CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_musics (
  playlist_id TEXT NOT NULL,
  music_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, music_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (music_id) REFERENCES musics(id) ON DELETE CASCADE
);

CREATE TABLE cover_cache (
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  PRIMARY KEY (artist, album)
);
```

### Testing Strategy

**Unit Tests** (co-localized with source files)
- Use cases: Mock repositories, test business logic
- Services: Mock external APIs, test error handling
- Follow `docs/skills/TESTING_API_GUIDELINE.md`

**Integration Tests** (co-localized with source files)
- Repositories: Real SQLite in-memory database
- Routes: supertest with Fastify instance

**E2E Tests** (separate folder)
- Full flow: scan → list → play → create playlist → add music

### Commands
```bash
pnpm --filter server test      # unit tests
pnpm --filter server typecheck # type checking
pnpm --filter mobile test      # unit tests
pnpm --filter mobile typecheck # type checking
pnpm run lint                  # Biome linting
pnpm run format                # Biome formatting
```

---

## Frontend (React Native + Expo)

### Tech Stack

| Tecnologia | Uso |
|-----------|-----|
| Expo SDK 51+ | Framework React Native |
| expo-av | Reprodução de áudio |
| React Navigation | Navegação entre telas |
| NativeWind | Styling com Tailwind CSS para React Native |
| @testing-library/react-native | Testes de componentes |
| Detox | Testes e2e |
| axios | Comunicação com API |
| Zod | Validação de schemas no frontend |
| Biome | Linting e formatação |

### Project Structure

```
mobile/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Music.ts
│   │   ├── contracts/
│   │   │   ├── repositories/
│   │   │   │   └── IMusicRepository.ts
│   │   │   └── services/
│   │   │       └── IAudioPlayer.ts
│   │   └── usecases/
│   │       ├── player/
│   │       │   ├── PlayMusic.ts
│   │       │   └── PlayMusic.test.ts
│   │       └── playlist/
│   │           ├── LoadPlaylist.ts
│   │           └── LoadPlaylist.test.ts
│   ├── infra/
│   │   ├── api/
│   │   │   └── MusicApi.ts
│   │   ├── audio/
│   │   │   └── AudioPlayer.ts
│   │   └── storage/
│   │       └── AsyncStorage.ts
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── HomeScreen.test.tsx
│   │   │   ├── PlayerScreen.tsx
│   │   │   ├── PlayerScreen.test.tsx
│   │   │   ├── SearchScreen.tsx
│   │   │   ├── SearchScreen.test.tsx
│   │   │   ├── PlaylistsScreen.tsx
│   │   │   └── PlaylistsScreen.test.tsx
│   │   ├── components/
│   │   │   ├── MusicCard.tsx
│   │   │   ├── MusicCard.test.tsx
│   │   │   ├── PlayerControls.tsx
│   │   │   ├── PlayerControls.test.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProgressBar.test.tsx
│   │   │   ├── Equalizer.tsx
│   │   │   └── Equalizer.test.tsx
│   │   └── navigation/
│   │       └── AppNavigator.tsx
│   └── hooks/
│       ├── usePlayer.ts
│       ├── usePlayer.test.ts
│       ├── usePlaylist.ts
│       └── usePlaylist.test.ts
├── tests/
│   └── e2e/
│       └── player-flow.test.ts
├── app.json
├── tsconfig.json
└── package.json
```

### Screens

**HomeScreen**
- Lista de músicas recentes/todas
- Navegação para playlists e busca

**PlayerScreen**
- Capa do álbum (grande)
- Nome da música, artista, álbum
- Barra de progresso (seek)
- Controles: play/pause, anterior, próximo
- Velocidade de reprodução (0.5x - 2.0x)
- Equalizer simples (bass, mid, treble)
- Botão adicionar à playlist

**SearchScreen**
- Campo de busca
- Resultados filtrados (músicas, artistas, álbuns)

**PlaylistsScreen**
- Lista de playlists
- Criar nova playlist
- Abrir playlist → ver músicas

### Audio Player (expo-av)

```typescript
// Responsibilities:
// - Load audio from stream URL
// - Play, pause, seek
// - Control playback speed
// - Handle audio focus
// - Background playback
```

### Testing Strategy

**Unit Tests** (co-localized)
- Use cases: Mock API and audio player
- Hooks: Render with testing library, mock services
- Follow `docs/skills/TESTING_FRONTEND_GUIDELINE.md`

**Integration Tests** (co-localized)
- Components: Render, simulate interactions, verify output
- Screens: Navigation testing with mock data

**E2E Tests** (separate folder)
- Full flow: Open app → search → play → create playlist → add music
- Follow `docs/skills/TESTING_FRONTEND_GUIDELINE.md`

---

## Deployment

### Backend
1. PC com HD externo montado
2. Node.js instalado
3. Script de init: `node dist/server.js`
4. Porta padrão: 3000

### Frontend
1. `eas build --profile preview` (APK para instalação manual)
2. Ou `expo start` para desenvolvimento

---

## Future Considerations

- Multiusuário com autenticação
- Download para offline
- Sync entre dispositivos
- Suporte a outros formatos (FLAC, WAV)
- iOS
