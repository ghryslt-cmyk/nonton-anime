import { Link, useNavigate } from 'react-router-dom'
import { Play, Search, User, Feather, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    setUser(null)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="bg-slate-900 border-b border-teal-700/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Feather className="w-8 h-8 text-teal-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
            WorldEnd Stream
          </span>
        </Link>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </form>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-300 hover:text-teal-400 transition">
            Home
          </Link>
          <Link to="/browse" className="text-gray-300 hover:text-teal-400 transition">
            Browse
          </Link>
          <Link to="/trending" className="text-gray-300 hover:text-teal-400 transition">
            Trending
          </Link>
          <Link to="/popular" className="text-gray-300 hover:text-teal-400 transition">
            Popular
          </Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-gray-300 hover:text-teal-400 transition">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-gray-300 hover:text-teal-400 transition">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition">
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
