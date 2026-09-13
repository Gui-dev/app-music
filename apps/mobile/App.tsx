import './global.css'
import { useState } from 'react'
import { Text, TextInput, FlatList, TouchableOpacity, View, SafeAreaView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MusicCard } from './presentation/components/music-card'
import { PlayerControls } from './presentation/components/player-controls'
import { ProgressBar } from './presentation/components/progress-bar'
import { Equalizer } from './presentation/components/equalizer'
import { BottomNav } from './presentation/components/bottom-nav'

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
	{ id: '4', title: 'Midnight Drive', artist: 'The Night Owls', album: 'Nocturnal', duration: 210 },
	{ id: '5', title: 'Neon Dreams', artist: 'Synthwave Collective', album: 'Retro Future', duration: 195 },
	{ id: '6', title: 'Ocean Waves', artist: 'Ambient Sounds', album: 'Nature', duration: 300 },
]

export default function App() {
	const [screen, setScreen] = useState<Screen>('Player')
	const [selectedMusic, setSelectedMusic] = useState<Music | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	// Mock duration for demo
	const selectedDuration = selectedMusic?.duration ? selectedMusic.duration * 1000 : 180000

	const handleSeek = (value: number) => {
		setProgress(value)
		setCurrentTime(value * selectedDuration)
	}

	const togglePlay = () => setIsPlaying(!isPlaying)

	const goNext = () => {
		if (!selectedMusic) return
		const index = MOCK_MUSICS.findIndex((m) => m.id === selectedMusic.id)
		const next = MOCK_MUSICS[(index + 1) % MOCK_MUSICS.length]
		setSelectedMusic(next)
		setIsPlaying(true)
		setProgress(0)
		setCurrentTime(0)
	}

	const goPrev = () => {
		if (!selectedMusic) return
		const index = MOCK_MUSICS.findIndex((m) => m.id === selectedMusic.id)
		const prev = MOCK_MUSICS[(index - 1 + MOCK_MUSICS.length) % MOCK_MUSICS.length]
		setSelectedMusic(prev)
		setIsPlaying(true)
		setProgress(0)
		setCurrentTime(0)
	}

	return (
		<SafeAreaView className="flex-1 bg-bg" edges={['top']}>
			<View className="flex-1">
				{screen === 'Player' && (
					<View className="flex-1 items-center justify-center p-6">
						{selectedMusic ? (
							<View className="w-full max-w-md items-center">
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Ionicons name="musical-notes" size={64} color="#FACC16" />
								</View>
								<Text className="text-xl font-bold text-text-primary text-center mb-1">{selectedMusic.title}</Text>
								<Text className="text-base text-text-secondary text-center mb-0.5">{selectedMusic.artist}</Text>
								<Text className="text-sm text-text-secondary text-center mb-6">{selectedMusic.album}</Text>

								<ProgressBar
									progress={progress}
									currentTime={currentTime}
									duration={selectedDuration}
									onSeek={(value) => handleSeek(value)}
								/>

								<PlayerControls
									isPlaying={isPlaying}
									onPlay={() => setIsPlaying(true)}
									onPause={() => setIsPlaying(false)}
									onPrev={goPrev}
									onNext={goNext}
								/>
							</View>
						) : (
							<View className="items-center">
								<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
									<Ionicons name="musical-notes" size={64} color="#FACC16" />
								</View>
								<Text className="text-xl font-bold text-text-primary">No music selected</Text>
								<Text className="mt-1 text-base text-text-secondary">Select a song from Biblioteca</Text>
							</View>
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
								<MusicCard
									music={item}
									onPress={() => {
										setSelectedMusic(item)
										setScreen('Player')
									}}
								/>
							)}
						/>
					</View>
				)}

				{screen === 'Biblioteca' && (
					<View className="flex-1">
						<View className="p-4">
							<Text className="mb-4 text-2xl font-bold text-text-primary">Biblioteca</Text>
							<Text className="text-sm text-text-secondary">{MOCK_MUSICS.length} faixas</Text>
						</View>
						<FlatList
							data={MOCK_MUSICS}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<MusicCard
									music={item}
									onPress={() => {
										setSelectedMusic(item)
										setScreen('Player')
									}}
									showDuration
								/>
							)}
						/>
					</View>
				)}

				{screen === 'Equalizer' && (
					<Equalizer />
				)}

				<BottomNav screen={screen} setScreen={setScreen} />
			</View>
		</SafeAreaView>
	)
}