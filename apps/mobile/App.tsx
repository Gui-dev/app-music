import './global.css'
import { useState } from 'react'
import { Text, TextInput, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer'

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

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
	return (
		<View className="flex-row justify-around border-t border-border px-4 pb-4 pt-3">
			<TouchableOpacity onPress={() => setScreen('Player')} className="items-center">
				<Ionicons name={screen === 'Player' ? 'musical-notes' : 'musical-notes-outline'} size={24} color={screen === 'Player' ? '#FACC16' : '#404047'} />
				<Text className={`mt-1 text-xs ${screen === 'Player' ? 'text-primary' : 'text-text-secondary'}`}>Player</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Search')} className="items-center">
				<Ionicons name={screen === 'Search' ? 'search' : 'search-outline'} size={24} color={screen === 'Search' ? '#FACC16' : '#404047'} />
				<Text className={`mt-1 text-xs ${screen === 'Search' ? 'text-primary' : 'text-text-secondary'}`}>Search</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Biblioteca')} className="items-center">
				<Ionicons name={screen === 'Biblioteca' ? 'library' : 'library-outline'} size={24} color={screen === 'Biblioteca' ? '#FACC16' : '#404047'} />
				<Text className={`mt-1 text-xs ${screen === 'Biblioteca' ? 'text-primary' : 'text-text-secondary'}`}>Biblioteca</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Equalizer')} className="items-center">
				<Ionicons name={screen === 'Equalizer' ? 'equalizer' : 'equalizer-outline'} size={24} color={screen === 'Equalizer' ? '#FACC16' : '#404047'} />
				<Text className={`mt-1 text-xs ${screen === 'Equalizer' ? 'text-primary' : 'text-text-secondary'}`}>Equalizador</Text>
			</TouchableOpacity>
		</View>
	)
}

export default function App() {
	const [screen, setScreen] = useState<Screen>('Player')
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<View className="flex-1 items-center justify-center p-6">
						{selectedMusic ? (
							<>
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Text className="text-6xl text-primary">♪</Text>
								</View>
								<Text className="text-xl font-bold text-text-primary">{selectedMusic.title}</Text>
								<Text className="mt-1 text-base text-text-secondary">{selectedMusic.artist}</Text>
								<Text className="mt-0.5 text-sm text-text-secondary">{selectedMusic.album}</Text>
							</>
						) : (
							<>
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Text className="text-6xl text-primary">♪</Text>
								</View>
								<Text className="text-xl font-bold text-text-primary">No music selected</Text>
								<Text className="mt-1 text-base text-text-secondary">Select a song from Biblioteca</Text>
							</>
						)}
					</View>
				)}

				{screen === 'Search' && (
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
										<Text className="text-base font-semibold text-text-primary">{item.title}</Text>
										<Text className="text-sm text-text-secondary">{item.artist}</Text>
									</View>
								</TouchableOpacity>
							)}
						/>
					</View>
				)}

				{screen === 'Biblioteca' && (
					<View className="flex-1">
						<View className="p-4">
							<Text className="mb-4 text-2xl font-bold text-text-primary">Biblioteca</Text>
							<Text className="text-sm text-text-secondary">3 faixas</Text>
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
										<Text className="text-base font-semibold text-text-primary">{item.title}</Text>
										<Text className="text-sm text-text-secondary">{item.artist}</Text>
									</View>
									{item.duration != null && (
										<Text className="ml-2 text-xs text-text-secondary">
											{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
										</Text>
									)}
								</TouchableOpacity>
							)}
						/>
					</View>
				)}

				{screen === 'Equalizer' && (
					<View className="flex-1 p-4">
						<Text className="mb-6 text-2xl font-bold text-text-primary">Equalizador</Text>

						<View className="mb-6">
							<View className="mb-2 flex-row items-center justify-between">
								<Text className="text-text-primary">Graves (Bass)</Text>
								<Text className="text-primary">+4 dB</Text>
							</View>
							<View className="h-2 rounded-full bg-surface">
								<View className="h-2 w-3/5 rounded-full bg-primary" />
							</View>
						</View>

						<View className="mb-6">
							<View className="mb-2 flex-row items-center justify-between">
								<Text className="text-text-primary">Médios (Mid)</Text>
								<Text className="text-primary">+1 dB</Text>
							</View>
							<View className="h-2 rounded-full bg-surface">
								<View className="h-2 w-1/2 rounded-full bg-primary" />
							</View>
						</View>

						<View className="mb-6">
							<View className="mb-2 flex-row items-center justify-between">
								<Text className="text-text-primary">Agudos (Treble)</Text>
								<Text className="text-primary">+3 dB</Text>
							</View>
							<View className="h-2 rounded-full bg-surface">
								<View className="h-2 w-[45%] rounded-full bg-primary" />
							</View>
						</View>

						<View className="flex-row gap-3">
							<TouchableOpacity className="rounded-lg bg-primary px-6 py-3">
								<Text className="font-bold text-bg">FLAT</Text>
							</TouchableOpacity>
							<TouchableOpacity className="rounded-lg bg-surface px-6 py-3">
								<Text className="text-text-primary">BASS BOOST</Text>
							</TouchableOpacity>
							<TouchableOpacity className="rounded-lg bg-surface px-6 py-3">
								<Text className="text-text-primary">ROCK</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}

				<BottomNav screen={screen} setScreen={setScreen} />
			</View>
		</SafeAreaView>
	)
}
