import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useRoute, type RouteProp } from '@react-navigation/native'
import { usePlayer } from '../../hooks/use-player'
import { PlayerControls } from '../components/player-controls'
import { ProgressBar } from '../components/progress-bar'
import { Equalizer } from '../components/equalizer'
import type { Music } from '../../infra/api/music-api'

type RootStackParamList = {
	Player: { music: Music }
}

type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>

export function PlayerScreen() {
	const route = useRoute<PlayerScreenRouteProp>()
	const { music } = route.params

	const {
		isPlaying,
		positionMillis,
		durationMillis,
		rate,
		loadAndPlay,
		play,
		pause,
		seek,
		setRate,
	} = usePlayer()

	const [bass, setBass] = useState(0.5)
	const [mid, setMid] = useState(0.5)
	const [treble, setTreble] = useState(0.5)

	useEffect(() => {
		loadAndPlay(music)
	}, [music.id])

	return (
		<View className="flex-1 justify-between bg-bg p-6">
			<View className="items-center">
				<View className="mb-6 h-64 w-64 items-center justify-center rounded-2xl bg-surface">
					<Text className="text-6xl text-primary">♪</Text>
				</View>

				<Text className="text-center text-xl font-bold text-text-primary">
					{music.title}
				</Text>
				<Text className="mt-1 text-base text-text-secondary">
					{music.artist}
				</Text>
				<Text className="mt-0.5 text-sm text-text-secondary">
					{music.album}
				</Text>
			</View>

			<View>
				<ProgressBar
					positionMillis={positionMillis}
					durationMillis={durationMillis}
					onSeek={seek}
				/>

				<View className="mt-6">
					<PlayerControls
						isPlaying={isPlaying}
						onPlay={play}
						onPause={pause}
					/>
				</View>

				<View className="mt-6 flex-row justify-center gap-4">
					{[0.5, 1, 1.5, 2].map((speed) => (
						<Text
							key={speed}
							onPress={() => setRate(speed)}
							className={`rounded-full px-3 py-1 text-sm ${
								rate === speed
									? 'bg-primary text-bg'
									: 'bg-surface text-text-secondary'
							}`}
						>
							{speed}x
						</Text>
					))}
				</View>

				<View className="mt-6">
					<Equalizer
						bass={bass}
						mid={mid}
						treble={treble}
						onBassChange={setBass}
						onMidChange={setMid}
						onTrebleChange={setTreble}
					/>
				</View>
			</View>
		</View>
	)
}
