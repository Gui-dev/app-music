import './global.css'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AppContent } from './src/app-content'
import { type Music, musicApi, type Playlist } from './src/infra/api/music-api'
import { BottomNav } from './src/presentation/components/bottom-nav'
import { Equalizer } from './src/presentation/components/equalizer'
import { MusicCard } from './src/presentation/components/music-card'
import { PlayerControls } from './src/presentation/components/player-controls'
import { ProgressBar } from './src/presentation/components/progress-bar'
import { QueryProvider } from './src/providers/query-provider'

type Screen = 'Player' | 'Search' | 'Biblioteca' | 'Equalizer'

export default function App() {
	return (
		<QueryProvider>
			<AppContent />
		</QueryProvider>
	)
}
