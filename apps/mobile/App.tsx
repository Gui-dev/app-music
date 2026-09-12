import { registerRootComponent } from 'expo'
import { AppNavigator } from './src/navigation/app-navigator'

function App() {
	return <AppNavigator />
}

registerRootComponent(App)
