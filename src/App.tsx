import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Trending from './pages/Trending'
import Watchlist from './pages/Watchlist'
import MovieDetail from './pages/MovieDetail'
import TVDetail from './pages/TVDetail'
import PersonDetail from './pages/PersonDetail'
import Upcoming from './pages/Upcoming'
import Compare from './pages/Compare'
import Watched from './pages/Watched'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'trending', element: <Trending /> },
      { path: 'search', element: <Search /> },
      { path: 'watchlist', element: <Watchlist /> },
      { path: 'movie/:id', element: <MovieDetail /> },
      { path: 'tv/:id', element: <TVDetail /> },
      { path: 'person/:id', element: <PersonDetail /> },
      { path: 'upcoming', element: <Upcoming /> },
      { path: 'compare', element: <Compare /> },
      { path: 'watched', element: <Watched /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
