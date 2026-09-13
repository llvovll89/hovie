import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'
import RouteError from './components/ui/RouteError'

// ── Route-based code splitting ────────────────────────────────
const Home       = lazy(() => import('./pages/Home'))
const Search     = lazy(() => import('./pages/Search'))
const Trending   = lazy(() => import('./pages/Trending'))
const Watchlist  = lazy(() => import('./pages/Watchlist'))
const MovieDetail = lazy(() => import('./pages/MovieDetail'))
const TVDetail   = lazy(() => import('./pages/TVDetail'))
const PersonDetail = lazy(() => import('./pages/PersonDetail'))
const Upcoming   = lazy(() => import('./pages/Upcoming'))
const Compare    = lazy(() => import('./pages/Compare'))
const Watched    = lazy(() => import('./pages/Watched'))
const Stats      = lazy(() => import('./pages/Stats'))

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={36} />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true,            element: <Suspense fallback={<PageFallback />}><Home /></Suspense>, errorElement: <RouteError /> },
      { path: 'trending',       element: <Suspense fallback={<PageFallback />}><Trending /></Suspense>, errorElement: <RouteError /> },
      { path: 'search',         element: <Suspense fallback={<PageFallback />}><Search /></Suspense>, errorElement: <RouteError /> },
      { path: 'watchlist',      element: <Suspense fallback={<PageFallback />}><Watchlist /></Suspense>, errorElement: <RouteError /> },
      { path: 'movie/:id',      element: <Suspense fallback={<PageFallback />}><MovieDetail /></Suspense>, errorElement: <RouteError /> },
      { path: 'tv/:id',         element: <Suspense fallback={<PageFallback />}><TVDetail /></Suspense>, errorElement: <RouteError /> },
      { path: 'person/:id',     element: <Suspense fallback={<PageFallback />}><PersonDetail /></Suspense>, errorElement: <RouteError /> },
      { path: 'upcoming',       element: <Suspense fallback={<PageFallback />}><Upcoming /></Suspense>, errorElement: <RouteError /> },
      { path: 'compare',        element: <Suspense fallback={<PageFallback />}><Compare /></Suspense>, errorElement: <RouteError /> },
      { path: 'watched',        element: <Suspense fallback={<PageFallback />}><Watched /></Suspense>, errorElement: <RouteError /> },
      { path: 'stats',          element: <Suspense fallback={<PageFallback />}><Stats /></Suspense>, errorElement: <RouteError /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Analytics />
    </ThemeProvider>
  )
}
