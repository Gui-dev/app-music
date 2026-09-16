import { FlatList, Text, TextInput, View } from 'react-native'
import { MusicCard } from '../presentation/components/music-card'
import type { Music } from '../infra/api/music-api'

interface SearchScreenProps {
	searchQuery: string
	setSearchQuery: (query: string) => void
	searchResults: { data?: Music[]; isLoading: boolean }
	onSelectMusic: (music: Music) => void
	onAddToPlaylist: (musicId: string) => void
}

export function SearchScreen({
	searchQuery,
	setSearchQuery,
	searchResults,
	onSelectMusic,
	onAddToPlaylist,
}: SearchScreenProps) {
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
			{searchResults.isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Searching...</Text>
				</View>
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
							onPress={() => onSelectMusic(item)}
							onAddToPlaylist={() => onAddToPlaylist(item.id)}
						/>
					)}
				/>
			)}
		</View>
	)
}
