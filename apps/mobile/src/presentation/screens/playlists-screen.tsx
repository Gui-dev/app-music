import { useEffect, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { usePlaylist } from '../../hooks/use-playlist'

export function PlaylistsScreen() {
	const { playlists, isLoading, fetchPlaylists, createPlaylist } = usePlaylist()
	const [newName, setNewName] = useState('')

	useEffect(() => {
		fetchPlaylists()
	}, [])

	async function handleCreate() {
		if (newName.trim().length === 0) return
		await createPlaylist(newName.trim())
		setNewName('')
	}

	return (
		<View className="flex-1 bg-bg">
			<View className="p-4">
				<Text className="mb-4 text-2xl font-bold text-text-primary">Playlists</Text>

				<View className="flex-row gap-2">
					<TextInput
						className="flex-1 rounded-lg bg-surface px-4 py-3 text-text-primary"
						placeholder="New playlist name..."
						placeholderTextColor="#404047"
						value={newName}
						onChangeText={setNewName}
					/>
					<TouchableOpacity
						onPress={handleCreate}
						className="rounded-lg bg-primary px-4 py-3"
					>
						<Text className="font-semibold text-bg">Create</Text>
					</TouchableOpacity>
				</View>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-text-secondary">Loading...</Text>
				</View>
			) : (
				<FlatList
					data={playlists}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View className="mx-4 mb-2 rounded-lg bg-surface p-4">
							<Text className="text-base font-semibold text-text-primary">
								{item.name}
							</Text>
							<Text className="mt-1 text-sm text-text-secondary">
								{item.musicIds.length} songs
							</Text>
						</View>
					)}
					contentContainerClassName="pb-4"
				/>
			)}
		</View>
	)
}
