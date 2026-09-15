import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { mockMusics } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { useMusic, useMusics, useSearchMusics } from './use-musics'

function createQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
}

function createWrapper() {
	const queryClient = createQueryClient()
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
	}
}

describe('useMusics', () => {
	it('fetches music list successfully', async () => {
		const { result } = renderHook(() => useMusics(), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockMusics)
	})

	it('handles error state', async () => {
		server.use(
			http.get('*/music', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => useMusics(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true), {
			timeout: 3000,
		})

		expect(result.current.error).toBeTruthy()
	})
})

describe('useMusic', () => {
	it('fetches a single music by id', async () => {
		const { result } = renderHook(() => useMusic('1'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockMusics[0])
	})

	it('does not fetch when id is empty', () => {
		const { result } = renderHook(() => useMusic(''), {
			wrapper: createWrapper(),
		})

		expect(result.current.fetchStatus).toBe('idle')
	})

	it('returns 404 for nonexistent music', async () => {
		const { result } = renderHook(() => useMusic('999'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true), {
			timeout: 3000,
		})

		expect(result.current.error).toBeTruthy()
	})
})

describe('useSearchMusics', () => {
	it('searches musics by query', async () => {
		const { result } = renderHook(() => useSearchMusics('queen'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual([mockMusics[0]])
	})

	it('does not search when query is empty', () => {
		const { result } = renderHook(() => useSearchMusics(''), {
			wrapper: createWrapper(),
		})

		expect(result.current.fetchStatus).toBe('idle')
	})

	it('returns empty array for no matches', async () => {
		const { result } = renderHook(() => useSearchMusics('nonexistent'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual([])
	})
})
