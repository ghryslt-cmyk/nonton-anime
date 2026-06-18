import { Link, useNavigate } from 'react-router-dom'
import { Play, Search, User, Feather, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <nav className="bg-slate-900 border-b border-purple-700/50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="WorldEnd Stream" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            WorldEnd Stream
          </span>
        </Link>
        
        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <form onSubmit={handleSearch} className="w-full">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </form>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-gray-300 hover:text-purple-400 transition">
            Home
          </Link>
          <Link to="/browse" className="text-gray-300 hover:text-purple-400 transition">
            Browse
          </Link>
          <Link to="/trending" className="text-gray-300 hover:text-purple-400 transition">
            Trending
          </Link>
          <Link to="/popular" className="text-gray-300 hover:text-purple-400 transition">
            Genre
          </Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" className="text-gray-300 hover:text-purple-400 transition">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="text-gray-300 hover:text-purple-400 transition">
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
            <Link to="/login" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-slate-700 pt-4">
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </form>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/browse" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
              Browse
            </Link>
            <Link to="/trending" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
              Trending
            </Link>
            <Link to="/popular" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
              Genre
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-purple-400 transition py-2" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition w-fit"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition w-fit" onClick={() => setMobileMenuOpen(false)}>
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
