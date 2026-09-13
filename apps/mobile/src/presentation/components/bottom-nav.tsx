import { View, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer'

interface BottomNavProps {
	screen: Screen
	setScreen: (s: Screen) => void
}

export function BottomNav({ screen, setScreen }: BottomNavProps) {
	return (
		<View className="flex-row justify-around border-t border-border px-4 pb-4 pt-3">
			<TouchableOpacity onPress={() => setScreen('Player')} className="items-center">
				<Ionicons
					name={screen === 'Player' ? 'musical-notes' : 'musical-notes-outline'}
					size={24}
					color={screen === 'Player' ? '#FACC16' : '#404047'}
				/>
				<Text className={`mt-1 text-xs ${screen === 'Player' ? 'text-primary' : 'text-text-secondary'}`}>
					Player
				</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Search')} className="items-center">
				<Ionicons
					name={screen === 'Search' ? 'search' : 'search-outline'}
					size={24}
					color={screen === 'Search' ? '#FACC16' : '#404047'}
				/>
				<Text className={`mt-1 text-xs ${screen === 'Search' ? 'text-primary' : 'text-text-secondary'}`}>
					Search
				</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Biblioteca')} className="items-center">
				<Ionicons
					name={screen === 'Biblioteca' ? 'library' : 'library-outline'}
					size={24}
					color={screen === 'Biblioteca' ? '#FACC16' : '#404047'}
				/>
				<Text className={`mt-1 text-xs ${screen === 'Biblioteca' ? 'text-primary' : 'text-text-secondary'}`}>
					Biblioteca
				</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => setScreen('Equalizer')} className="items-center">
				<Ionicons
					name={(screen === 'Equalizer' ? 'options' : 'options-outline') as any}
					size={24}
					color={screen === 'Equalizer' ? '#FACC16' : '#404047'}
				/>
				<Text className={`mt-1 text-xs ${screen === 'Equalizer' ? 'text-primary' : 'text-text-secondary'}`}>
					Equalizador
				</Text>
			</TouchableOpacity>
		</View>
	)
}