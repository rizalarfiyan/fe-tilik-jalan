import AuthProvider from '@providers/auth-provider'
import RouteProvider from '@providers/route-provider'

function App() {
	return (
		<AuthProvider>
			<RouteProvider />
		</AuthProvider>
	)
}

export default App
