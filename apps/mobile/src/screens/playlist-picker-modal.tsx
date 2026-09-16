import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import type { Playlist } from '../infra/api/music-api'

interface PlaylistPickerModalProps {
	visible: boolean
	playlists: Playlist[]
	onSelect: (playlistId: string) => void
	onClose: () => void
}

export function PlaylistPickerModal({
	visible,
	playlists,
	onSelect,
	onClose,
}: PlaylistPickerModalProps) {
	if (!visible) return null

	return (
		<View className="flex-1 justify-end bg-black/60">
			<View className="rounded-t-2xl bg-surface p-4">
				<Text className="mb-4 text-lg font-bold text-text-primary">
					Adicionar à playlist
				</Text>
				<FlatList
					data={playlists}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => onSelect(item.id)}
							className="mb-2 rounded-lg bg-surface-hover p-3"
						>
							<Text className="text-base text-text-primary">
								{item.name}
							</Text>
						</TouchableOpacity>
					)}
				/>
				<TouchableOpacity
					onPress={onClose}
					className="mt-2 items-center py-3"
				>
					<Text className="text-text-secondary">Cancelar</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}
