import { Link } from 'react-router-dom'
import { Star, Play, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function Home() {
  const [animeList, setAnimeList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnime()
  }, [])

  const loadAnime = async () => {
    try {
      const data = await animeAPI.getAll()
      setAnimeList(data)
    } catch (err) {
      console.error('Failed to load anime:', err)
      // Fallback to mock data if API fails
      const { animeData } = await import('../data/animeData')
      // Map mock data to match API structure - use full URL for images
      const mappedData = animeData.map(anime => ({
        ...anime,
        image_url: anime.image, // Use external URLs for mock data
      }))
      setAnimeList(mappedData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="WorldEnd Stream" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              <h1 className="text-2xl md:text-4xl font-bold">WorldEnd Stream</h1>
            </div>
            <p className="text-base md:text-lg text-gray-200 mb-6">
              Discover, review, and watch your favorite anime
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/browse" className="bg-purple-600 hover:bg-purple-700 px-5 md:px-6 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm md:text-base">
                <Play className="w-4 h-4" />
                Start Watching
              </Link>
              <Link to="/browse" className="bg-white/10 hover:bg-white/20 backdrop-blur px-5 md:px-6 py-2.5 rounded-lg font-medium transition text-center text-sm md:text-base">
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-purple-500">🔥</span> Trending Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
          {animeList.slice(0, 5).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
              <div className="relative bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                {anime.image_url ? (
                  <img
                    src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                    alt={anime.title}
                    className="w-full h-44 md:h-56 object-cover"
                    onError={(e) => {
                      console.error('Image load error:', anime.image_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : (
                  <div className="w-full h-44 md:h-56 bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="fallback-image w-full h-44 md:h-56 bg-slate-700 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-sm">Image Error</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <Play className="w-6 md:w-8 h-6 md:h-8 text-white" />
                </div>
                <div className="p-2 md:p-3">
                  <h3 className="font-medium text-xs md:text-sm line-clamp-2">{anime.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{anime.rating || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Genre Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
          <span className="text-purple-500">🎭</span> Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'].map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="px-3 py-1.5 bg-slate-800 hover:bg-purple-600 rounded-full text-xs md:text-sm font-medium transition"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Updates */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h2 className="text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
          <span className="text-purple-500">📺</span> Latest Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {animeList.slice(0, 3).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="flex gap-3 bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-700 transition">
              {anime.image_url ? (
                <img
                  src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                  alt={anime.title}
                  className="w-20 md:w-28 h-16 md:h-20 object-cover"
                  onError={(e) => {
                    console.error('Image load error:', anime.image_url);
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                  }}
                />
              ) : (
                <div className="w-20 md:w-28 h-16 md:h-20 bg-slate-700 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
              <div className="fallback-image w-20 md:w-28 h-16 md:h-20 bg-slate-700 flex items-center justify-center hidden">
                <span className="text-gray-500 text-xs">Image Error</span>
              </div>
              <div className="p-2.5 flex-1">
                <h3 className="font-medium text-sm line-clamp-2">{anime.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Episode {anime.episodes}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{anime.rating || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
