import * as React from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import LoadingScreen from '@components/loading-screen'
import useAuth from '@hooks/use-auth'

const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
	},
	defaultPreload: 'intent',
	defaultPreloadStaleTime: 0,
	defaultPendingMinMs: 0,
	defaultPendingComponent: () => <LoadingScreen reason="Collecting data..." />,
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}

	interface HistoryState {
		redirectTo?: string
	}
}

const RouteProvider: React.FC<React.PropsWithChildren> = () => {
	const auth = useAuth()
	return (
		<React.Suspense
			fallback={<LoadingScreen reason="Initializing router..." />}
		>
			<RouterProvider router={router} context={{ auth }} />
		</React.Suspense>
	)
}

export default RouteProvider
