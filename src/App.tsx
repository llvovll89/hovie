import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Trending from './pages/Trending'
import Watchlist from './pages/Watchlist'
import MovieDetail from './pages/MovieDetail'

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
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
