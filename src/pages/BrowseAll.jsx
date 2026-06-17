import { Link } from 'react-router-dom'
import { Star, Play, Calendar, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

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
      <div className="bg-gradient-to-r from-teal-900 to-cyan-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Browse All Anime</h1>
          <p className="text-xl text-gray-300">Explore our complete collection of anime</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>

        {/* Anime Grid */}
        {filteredAnime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAnime.map((anime) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
                <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {anime.image_url ? (
                      <img
                        src={`http://localhost:5000${anime.image_url}`}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 bg-teal-600 px-3 py-1 rounded-full text-sm font-semibold">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-teal-400 transition">
                      {anime.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{anime.rating || 'N/A'}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">
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
