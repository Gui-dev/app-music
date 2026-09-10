# AGENTS.md

## Project Overview

Music Streaming App — Aplicativo Android de streaming de música pessoal. Acessa uma biblioteca de MP3s armazenados em HD externo conectado a um PC, permitindo ouvir de qualquer lugar via streaming.

**Architecture:** Monorepo com backend Fastify e app mobile React Native (Expo), comunicados via HTTP.

## Tech Stack

### Root
- **pnpm** — Package manager para todo o monorepo
- **Biome** — Linting e formatação unificados
- **Zod** — Validação de schemas (frontend e backend)

### Backend (`apps/server/`)
- **Fastify** — Servidor HTTP
- **@fastify/type-provider-zod** — Validação de schemas no backend
- **Drizzle ORM + better-sqlite3** — ORM e banco SQLite
- **music-metadata** — Ler tags ID3 dos MP3s
- **vitest + supertest** — Testes unitários/integration
- **tsx** — Execução TypeScript

### Frontend (`apps/mobile/`)
- **Expo SDK 51+** — Framework React Native
- **expo-av** — Reprodução de áudio
- **React Navigation** — Navegação entre telas
- **NativeWind** — Styling com Tailwind CSS para React Native
- **axios** — Comunicação com API
- **Zod** — Validação de schemas no frontend
- **@testing-library/react-native** — Testes de componentes
- **Detox** — Testes e2e

## Color Palette (Design Tokens)

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

## Commit Guidelines

Conventional Commits (English), following `docs/skills/COMMITS_GUIDELINE.md`:
- Format: `<type>(<scope>): <description>`
- Types: feat, fix, docs, style, refactor, perf, test, chore
- English only, imperative mood, lowercase start, no period
- Example: `feat(player): add equalizer controls`

## Testing Guidelines

### Backend API (`docs/skills/TESTING_API_GUIDELINE.md`)
- Vitest, Hexagonal Architecture
- Co-located tests with source files (`.spec.ts`)
- In-memory repositories for unit tests
- DomainError typed errors
- Coverage gate: 80% on domain/use-case paths

### Frontend (`docs/skills/TESTING_FRONTEND_GUIDELINE.md`)
- Vitest + React Testing Library
- MSW v2 for HTTP mocking
- Co-located `.spec.tsx` files
- Playwright for E2E
- `@testing-library/jest-dom` matchers
- Accessible queries: `getByRole`, `getByLabelText`
- Coverage gate: 80% on components/hooks

## Key Conventions

1. **Zod schemas** são compartilhados entre frontend e backend para validação consistente
2. **NativeWind** usado para estilização — usar `className` com utility classes do Tailwind
3. **Biome** como ferramenta única de linting/formatação para todo o monorepo
4. **pnpm workspaces** para gerenciamento de dependências
5. **Testes co-localizados** com arquivos de fonte (`.spec.ts`, `.spec.tsx`)
6. **Commits em inglês** seguindo Conventional Commits
7. **Domínio** como prioridade: lógica de negócio em use cases, persistência repositórios
8. **kebab-case** para nomenclatura de arquivos (ex: `nome-do-arquivo.ts`, `database.ts`)
