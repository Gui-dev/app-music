import { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
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

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

export function HomeScreen() {
	const navigation = useNavigation<HomeScreenNavigationProp>()
	const [musics, setMusics] = useState<Music[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		loadMusics()
	}, [])

	async function loadMusics() {
		try {
			const data = await musicApi.listMusics()
			setMusics(data)
		} catch (error) {
			console.error('Failed to load musics:', error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<View className="flex-1 bg-bg">
			<View className="p-4">
				<Text className="text-2xl font-bold text-text-primary">Music</Text>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Loading...</Text>
				</View>
			) : (
				<FlatList
					data={musics}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<MusicCard
							music={item}
							onPress={(music) => navigation.navigate('Player', { music })}
						/>
					)}
					contentContainerClassName="px-4 pb-4"
				/>
			)}
		</View>
	)
}
