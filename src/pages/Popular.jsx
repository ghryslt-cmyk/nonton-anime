import { Link } from 'react-router-dom'
import { Star, Play, Flame } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

export default function Popular() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnime()
  }, [])

  const loadAnime = async () => {
    try {
      const data = await animeAPI.getAll()
      // Sort by rating for popular (can be improved with actual popularity logic)
      const sorted = data.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setAnime(sorted)
    } catch (err) {
      console.error('Failed to load anime:', err)
      const { animeData: mockData } = await import('../data/animeData')
      setAnime(mockData.sort((a, b) => b.rating - a.rating))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-900 to-red-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-400" />
            <h1 className="text-5xl font-bold">Popular Anime</h1>
          </div>
          <p className="text-xl text-gray-300">Most watched anime of all time</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {anime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {anime.map((anime) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
                <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300">
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
                        <div className="flex items-center gap-2 bg-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition">
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
            <p className="text-gray-400 text-lg">No popular anime found</p>
          </div>
        )}
      </div>
    </div>
  )
}
