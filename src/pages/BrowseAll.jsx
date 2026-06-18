import { Link } from 'react-router-dom'
import { Star, Play, Calendar, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function BrowseAll() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadAnime()
  }, [])

  const loadAnime = async () => {
    try {
      const data = await animeAPI.getAll()
      setAnime(data)
    } catch (err) {
      console.error('Failed to load anime:', err)
      // Fallback to mock data
      const { animeData: mockData } = await import('../data/animeData')
      setAnime(mockData)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnime = anime.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || a.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Browse All Anime</h1>
          <p className="text-base md:text-lg text-gray-300">Explore our complete collection</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base md:w-auto"
          >
            <option value="all">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>

        {/* Anime Grid */}
        {filteredAnime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {filteredAnime.map((anime) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
                <div className="bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {anime.image_url ? (
                      <img
                        src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-center gap-2 bg-purple-600/90 backdrop-blur px-3 py-2 rounded-full text-xs font-medium">
                          <Play className="w-3 h-3" />
                          Watch
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 group-hover:text-purple-400 transition">
                      {anime.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{anime.rating || 'N/A'}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-[10px]">
                        {anime.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No anime found</p>
          </div>
        )}
      </div>
    </div>
  )
}
