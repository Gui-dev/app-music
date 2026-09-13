import { useQuery } from '@tanstack/react-query'
import { musicApi, type Music } from '../../infra/api/music-api'

export function useMusics() {
	return useQuery({
		queryKey: ['musics'],
		queryFn: () => musicApi.listMusics(),
		staleTime: 5 * 60 * 1000,
		retry: 1,
	})
}

export function useMusic(id: string) {
	return useQuery({
		queryKey: ['musics', id],
		queryFn: () => musicApi.getMusic(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	})
}

export function useSearchMusics(query: string) {
	return useQuery({
		queryKey: ['musics', 'search', query],
		queryFn: () => musicApi.searchMusics(query),
		enabled: query.length > 0,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	})
}