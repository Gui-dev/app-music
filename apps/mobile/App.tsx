import './global.css'
import { useState } from 'react'
import { Text, TextInput, FlatList, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { QueryProvider } from './src/providers/query-provider'
import { MusicCard } from './src/presentation/components/music-card'
import { PlayerControls } from './src/presentation/components/player-controls'
import { ProgressBar } from './src/presentation/components/progress-bar'
import { Equalizer } from './src/presentation/components/equalizer'
import { BottomNav } from './src/presentation/components/bottom-nav'
import { AppContent } from './src/app-content'
import { musicApi, type Music, type Playlist } from './src/infra/api/music-api'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer'

export default function App() {
	return (
		<QueryProvider>
			<AppContent />
		</QueryProvider>
	)
}