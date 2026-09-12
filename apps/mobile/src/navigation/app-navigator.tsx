import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { Music } from '../infra/api/music-api'
import { HomeScreen } from '../presentation/screens/home-screen'
import { PlayerScreen } from '../presentation/screens/player-screen'
import { PlaylistsScreen } from '../presentation/screens/playlists-screen'
import { SearchScreen } from '../presentation/screens/search-screen'

export type RootStackParamList = {
	Home: undefined
	Player: { music: Music }
	Search: undefined
	Playlists: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppNavigator() {
	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName="Home"
				screenOptions={{
					headerStyle: { backgroundColor: '#0D0D0D' },
					headerTintColor: '#FFFFFF',
					contentStyle: { backgroundColor: '#0D0D0D' },
				}}
			>
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="Player" component={PlayerScreen} />
				<Stack.Screen name="Search" component={SearchScreen} />
				<Stack.Screen name="Playlists" component={PlaylistsScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}
