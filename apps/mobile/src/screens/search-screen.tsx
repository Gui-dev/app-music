import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { MusicCard } from '../presentation/components/music-card'
import type { Music } from '../infra/api/music-api'

interface SearchScreenProps {
	searchQuery: string
	setSearchQuery: (query: string) => void
	searchResults: { data?: Music[]; isLoading: boolean }
	onSelectMusic: (music: Music) => void
	onAddToPlaylist: (musicId: string) => void
	recentSearches: Music[]
	onAddRecentSearch: (music: Music) => void
	onClearRecentSearches: () => void
}

export function SearchScreen({
	searchQuery,
	setSearchQuery,
	searchResults,
	onSelectMusic,
	onAddToPlaylist,
	recentSearches,
	onAddRecentSearch,
	onClearRecentSearches,
}: SearchScreenProps) {
	const showRecent = searchQuery.length === 0 && recentSearches.length > 0

	return (
		<View className="flex-1">
			<View className="p-4">
				<TextInput
					className="rounded-lg bg-surface px-4 py-3 text-text-primary"
					placeholder="Search music..."
					placeholderTextColor="#404047"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>
			{showRecent && (
				<View className="px-4 mb-2 flex-row items-center justify-between">
					<Text className="text-sm font-semibold text-text-secondary">
						Buscas recentes
					</Text>
					<TouchableOpacity onPress={onClearRecentSearches}>
						<Text className="text-xs text-primary">Limpar</Text>
					</TouchableOpacity>
				</View>
			)}
			{searchResults.isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Searching...</Text>
				</View>
			) : showRecent ? (
				<FlatList
					data={recentSearches}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<MusicCard
							music={item}
							onPress={() => {
								onAddRecentSearch(item)
								onSelectMusic(item)
							}}
							onAddToPlaylist={() => onAddToPlaylist(item.id)}
						/>
					)}
				/>
			) : (
				<FlatList
					data={searchResults.data || []}
					keyExtractor={(item) => item.id}
					windowSize={5}
					maxToRenderPerBatch={10}
					removeClippedSubviews
					renderItem={({ item }) => (
						<MusicCard
							music={item}
							onPress={() => {
								onAddRecentSearch(item)
								onSelectMusic(item)
							}}
							onAddToPlaylist={() => onAddToPlaylist(item.id)}
						/>
					)}
				/>
			)}
		</View>
	)
}
