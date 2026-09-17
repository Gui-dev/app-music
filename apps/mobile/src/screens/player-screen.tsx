import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { CoverArt } from '../presentation/components/cover-art'
import { PlayerControls } from '../presentation/components/player-controls'
import { PlayerSkeleton } from '../presentation/components/player-skeleton'
import { ProgressBar } from '../presentation/components/progress-bar'
import type { Music } from '../infra/api/music-api'
import type { usePlayer } from '../hooks/use-player'

interface PlayerScreenProps {
	selectedMusic: Music | null
	player: ReturnType<typeof usePlayer>
	progress: number
	handleSeek: (value: number) => void
	goNext: () => void
	goPrev: () => void
	onAddToPlaylist: (musicId: string) => void
}

export function PlayerScreen({
	selectedMusic,
	player,
	progress,
	handleSeek,
	goNext,
	goPrev,
	onAddToPlaylist,
}: PlayerScreenProps) {
	if (!selectedMusic) {
		return (
			<View className="flex-1 items-center justify-center p-6">
				<CoverArt
					coverUrl={null}
					size={256}
					className="mb-6 rounded-2xl"
				/>
				<Text className="text-xl font-bold text-text-primary">
					No music selected
				</Text>
				<Text className="mt-1 text-base text-text-secondary">
					Select a song from Biblioteca
				</Text>
			</View>
		)
	}

	if (player.isLoading) {
		return <PlayerSkeleton />
	}

	return (
		<View className="flex-1 items-center justify-center p-6">
			<View className="w-full max-w-md items-center">
				<CoverArt
					coverUrl={selectedMusic.coverUrl}
					size={256}
					className="mb-6 rounded-2xl"
				/>
				<Text className="text-xl font-bold text-text-primary text-center mb-1">
					{selectedMusic.title}
				</Text>
				<Text className="text-base text-text-secondary text-center mb-0.5">
					{selectedMusic.artist}
				</Text>
				<Text className="text-sm text-text-secondary text-center mb-6">
					{selectedMusic.album}
				</Text>

				<TouchableOpacity
					onPress={() => onAddToPlaylist(selectedMusic.id)}
					className="mb-4 flex-row items-center gap-2"
				>
					<Ionicons name="add-circle-outline" size={20} color="#FACC16" />
					<Text className="text-sm text-primary">Adicionar à playlist</Text>
				</TouchableOpacity>

				{player.error && (
					<View className="mb-4 w-full flex-row items-center rounded-lg bg-red-900/40 p-3">
						<Ionicons name="alert-circle" size={18} color="#EF4444" />
						<Text className="ml-2 flex-1 text-sm text-red-400">
							{player.error}
						</Text>
						<TouchableOpacity onPress={player.clearError}>
							<Ionicons name="close" size={18} color="#EF4444" />
						</TouchableOpacity>
					</View>
				)}

				<ProgressBar
					progress={progress}
					currentTime={player.positionMillis}
					duration={player.durationMillis}
					onSeek={handleSeek}
				/>

				{player.isBuffering && !player.isLoading && (
					<View className="my-2 flex-row items-center gap-2">
						<ActivityIndicator size="small" color="#FACC16" />
						<Text className="text-xs text-text-secondary">
							Carregando...
						</Text>
					</View>
				)}

				<PlayerControls
					isPlaying={player.isPlaying}
					onPlay={() => player.play()}
					onPause={() => player.pause()}
					onPrev={goPrev}
					onNext={goNext}
				/>
			</View>
		</View>
	)
}
