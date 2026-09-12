import './global.css'
import { useState } from 'react'
import { Text, TextInput, FlatList, TouchableOpacity, View } from 'react-native'

type Screen = 'Home' | 'Search' | 'Playlists' | 'Player'

interface Music {
	id: string
	title: string
	artist: string
	album: string
	duration: number | null
}

const MOCK_MUSICS: Music[] = [
	{ id: '1', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', duration: 180 },
	{ id: '2', title: 'Song 2', artist: 'Artist 2', album: 'Album 2', duration: 240 },
	{ id: '3', title: 'Song 3', artist: 'Artist 3', album: 'Album 3', duration: 200 },
]

export default function App() {
	const [screen, setScreen] = useState<Screen>('Home')
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	if (screen === 'Player' && selectedMusic) {
		return (
			<View className="flex-1 bg-bg p-6">
				<TouchableOpacity onPress={() => setScreen('Home')}>
					<Text className="text-primary mb-6">← Back</Text>
				</TouchableOpacity>

				<View className="items-center">
					<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
						<Text className="text-6xl text-primary">♪</Text>
					</View>

					<Text className="text-xl font-bold text-text-primary">
						{selectedMusic.title}
					</Text>
					<Text className="mt-1 text-base text-text-secondary">
						{selectedMusic.artist}
					</Text>
					<Text className="mt-0.5 text-sm text-text-secondary">
						{selectedMusic.album}
					</Text>
				</View>

				<View className="mt-8 items-center">
					<TouchableOpacity className="h-16 w-16 items-center justify-center rounded-full bg-primary">
						<Text className="text-3xl text-bg">▶</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	if (screen === 'Search') {
		return (
			<View className="flex-1 bg-bg">
				<View className="p-4">
					<TouchableOpacity onPress={() => setScreen('Home')}>
						<Text className="text-primary mb-4">← Back</Text>
					</TouchableOpacity>
					<TextInput
						className="rounded-lg bg-surface px-4 py-3 text-text-primary"
						placeholder="Search music..."
						placeholderTextColor="#404047"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>
				<FlatList
					data={MOCK_MUSICS.filter((m) =>
						m.title.toLowerCase().includes(searchQuery.toLowerCase())
					)}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => {
								setSelectedMusic(item)
								setScreen('Player')
							}}
							className="mx-4 mb-2 flex-row items-center rounded-lg bg-surface p-3"
						>
							<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-surface-hover">
								<Text className="text-xl text-primary">♪</Text>
							</View>
							<View className="flex-1">
								<Text className="text-base font-semibold text-text-primary">
									{item.title}
								</Text>
								<Text className="text-sm text-text-secondary">
									{item.artist}
								</Text>
							</View>
						</TouchableOpacity>
					)}
				/>
			</View>
		)
	}

	if (screen === 'Playlists') {
		return (
			<View className="flex-1 bg-bg">
				<View className="p-4">
					<TouchableOpacity onPress={() => setScreen('Home')}>
						<Text className="text-primary mb-4">← Back</Text>
					</TouchableOpacity>
					<Text className="mb-4 text-2xl font-bold text-text-primary">
						Playlists
					</Text>
					<Text className="text-text-secondary">No playlists yet</Text>
				</View>
			</View>
		)
	}

	return (
		<View className="flex-1 bg-bg">
			<View className="flex-row items-center justify-between p-4">
				<Text className="text-2xl font-bold text-text-primary">Music</Text>
			</View>

			<FlatList
				data={MOCK_MUSICS}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() => {
							setSelectedMusic(item)
							setScreen('Player')
						}}
						className="mx-4 mb-2 flex-row items-center rounded-lg bg-surface p-3"
					>
						<View className="mr-3 h-12 w-12 items-center justify-center rounded-lg bg-surface-hover">
							<Text className="text-xl text-primary">♪</Text>
						</View>
						<View className="flex-1">
							<Text className="text-base font-semibold text-text-primary">
								{item.title}
							</Text>
							<Text className="text-sm text-text-secondary">
								{item.artist} — {item.album}
							</Text>
						</View>
						{item.duration != null && (
							<Text className="ml-2 text-xs text-text-secondary">
								{Math.floor(item.duration / 60)}:
								{String(item.duration % 60).padStart(2, '0')}
							</Text>
						)}
					</TouchableOpacity>
				)}
			/>

			<View className="flex-row justify-around border-t border-border p-4">
				<TouchableOpacity onPress={() => setScreen('Home')}>
					<Text className="text-primary">Home</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setScreen('Search')}>
					<Text className="text-text-secondary">Search</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setScreen('Playlists')}>
					<Text className="text-text-secondary">Playlists</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
