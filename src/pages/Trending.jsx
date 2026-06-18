import { Link } from 'react-router-dom'
import { Star, Play, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function Trending() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnime()
  }, [])

  const loadAnime = async () => {
    try {
      const data = await animeAPI.getAll()
      // Sort by rating for trending (can be improved with actual trending logic)
      const sorted = data.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      setAnime(sorted)
    } catch (err) {
      console.error('Failed to load anime:', err)
      const { animeData: mockData } = await import('../data/animeData')
      // Map mock data to match API structure
      const mappedData = mockData.map(anime => ({
        ...anime,
        image_url: anime.image, // Use external URLs for mock data
      }))
      setAnime(mappedData.sort((a, b) => b.rating - a.rating))
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
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="WorldEnd Stream" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <h1 className="text-2xl md:text-4xl font-bold">Trending Now</h1>
          </div>
          <p className="text-base md:text-lg text-gray-300">Most popular anime this week</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {anime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {anime.map((anime, index) => (
              <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
                <div className="bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 relative">
                  <div className="absolute top-2.5 left-2.5 bg-pink-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
                    #{index + 1}
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {anime.image_url ? (
                      <img
                        src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image load error:', anime.image_url);
                          e.target.style.display = 'none';
                          e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                    <div className="fallback-image w-full h-full bg-slate-700 flex items-center justify-center hidden">
                      <span className="text-gray-500 text-sm">Image Error</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 bg-pink-600/90 backdrop-blur px-3 py-2 rounded-full text-xs font-medium">
                          <Play className="w-3 h-3" />
                          Watch
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-medium text-xs md:text-sm line-clamp-2 group-hover:text-pink-400 transition">
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
            <p className="text-gray-400 text-base">No trending anime found</p>
          </div>
        )}
      </div>
    </div>
  )
}
