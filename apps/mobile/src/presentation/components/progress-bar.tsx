import { useMemo, useRef } from 'react'
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native'

interface ProgressBarProps {
	progress: number
	currentTime: number
	duration: number
	onSeek: (value: number) => void
}

export function ProgressBar({
	progress,
	currentTime,
	duration,
	onSeek,
}: ProgressBarProps) {
	const barWidth = useRef(300)
	const startPercent = useRef(0.5)

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000)
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60
		return `${minutes}:${String(seconds).padStart(2, '0')}`
	}

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onPanResponderGrant: (_, gesture) => {
					const width = barWidth.current
					const touchX = gesture.x0
					startPercent.current = Math.max(0, Math.min(1, touchX / width))
					onSeek(startPercent.current)
				},
				onPanResponderMove: (_, gesture) => {
					const width = barWidth.current
					const deltaPercent = gesture.dx / width
					const seekPercent = Math.max(
						0,
						Math.min(1, startPercent.current + deltaPercent),
					)
					onSeek(seekPercent)
				},
				onPanResponderRelease: () => {},
			}),
		[onSeek],
	)

	const handleLayout = (event: LayoutChangeEvent) => {
		barWidth.current = event.nativeEvent.layout.width
	}

	return (
		<View className="w-full px-4">
			<View className="flex-row justify-between mb-1">
				<Text className="text-xs text-text-secondary">
					{formatTime(currentTime)}
				</Text>
				<Text className="text-xs text-text-secondary">
					{formatTime(duration)}
				</Text>
			</View>
			<View
				onLayout={handleLayout}
				{...panResponder.panHandlers}
				className="h-2 bg-surface rounded-full overflow-hidden relative"
			>
				<View
					className="h-2 bg-primary rounded-full absolute top-0 left-0"
					style={{ width: `${progress * 100}%` }}
				/>
				<View
					className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 bg-primary rounded-full"
					style={{ marginRight: -2, left: `${progress * 100}%` }}
				/>
			</View>
		</View>
	)
}
