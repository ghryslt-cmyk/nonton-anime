import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AnimeDetail from './pages/AnimeDetail'
import Watch from './pages/Watch'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import BrowseAll from './pages/BrowseAll'
import Trending from './pages/Trending'
import Popular from './pages/Popular'
import JadwalRilis from './pages/JadwalRilis'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseAll />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/jadwal-rilis" element={<JadwalRilis />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
