import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { mockPlaylists } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { usePlaylists } from './use-playlists'

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

describe('usePlaylists', () => {
	it('fetches playlists successfully', async () => {
		const { result } = renderHook(() => usePlaylists(), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => expect(result.current.isSuccess).toBe(true))

		expect(result.current.data).toEqual(mockPlaylists)
	})

	it('handles error state', async () => {
		server.use(
			http.get('*/playlists', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		const { result } = renderHook(() => usePlaylists(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => expect(result.current.isError).toBe(true), {
			timeout: 3000,
		})

		expect(result.current.error).toBeTruthy()
	})
})
