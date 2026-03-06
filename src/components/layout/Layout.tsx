import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <main style={{ paddingTop: isHome ? 0 : 68 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
