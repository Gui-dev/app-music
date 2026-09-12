import { useState } from 'react'
import { FlatList, TextInput, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { MusicCard } from '../components/music-card'
import { musicApi, type Music } from '../../infra/api/music-api'

type RootStackParamList = {
	Home: undefined
	Player: { music: Music }
	Search: undefined
	Playlists: undefined
}

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>

export function SearchScreen() {
	const navigation = useNavigation<SearchScreenNavigationProp>()
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<Music[]>([])

	async function handleSearch(text: string) {
		setQuery(text)
		if (text.trim().length === 0) {
			setResults([])
			return
		}

		try {
			const data = await musicApi.searchMusics(text)
			setResults(data)
		} catch (error) {
			console.error('Search failed:', error)
		}
	}

	return (
		<View className="flex-1 bg-bg">
			<View className="p-4">
				<TextInput
					className="rounded-lg bg-surface px-4 py-3 text-text-primary"
					placeholder="Search music..."
					placeholderTextColor="#404047"
					value={query}
					onChangeText={handleSearch}
				/>
			</View>

			<FlatList
				data={results}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<MusicCard
						music={item}
						onPress={(music) => navigation.navigate('Player', { music })}
					/>
				)}
				contentContainerClassName="px-4 pb-4"
			/>
		</View>
	)
}
