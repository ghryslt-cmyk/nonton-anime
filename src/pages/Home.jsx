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
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <img src="/logo.png" alt="WorldEnd Stream" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to WorldEnd Stream</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Discover, review, and watch your favorite anime. Join our community of anime enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse" className="bg-purple-600 hover:bg-purple-700 px-6 md:px-8 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Start Watching
              </Link>
              <Link to="/browse" className="bg-slate-700 hover:bg-slate-600 px-6 md:px-8 py-3 rounded-lg font-semibold transition text-center">
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="text-purple-500">🔥</span> Trending Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {animeList.slice(0, 5).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="group">
              <div className="relative bg-slate-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                {anime.image_url ? (
                  <img
                    src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                    alt={anime.title}
                    className="w-full h-48 md:h-64 object-cover"
                    onError={(e) => {
                      console.error('Image load error:', anime.image_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : (
                  <div className="w-full h-48 md:h-64 bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
                <div className="fallback-image w-full h-48 md:h-64 bg-slate-700 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-sm">Image Error</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Play className="w-8 md:w-12 h-8 md:h-12 text-white" />
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-xs md:text-sm mb-2 line-clamp-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                    <Star className="w-3 h-3 md:w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{anime.rating || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Genre Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="text-purple-500">🎭</span> Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-3">
          {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'].map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Updates */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-2">
          <span className="text-purple-500">📺</span> Latest Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {animeList.slice(0, 3).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="flex gap-4 bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition">
              {anime.image_url ? (
                <img
                  src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                  alt={anime.title}
                  className="w-24 md:w-32 h-20 md:h-24 object-cover"
                  onError={(e) => {
                    console.error('Image load error:', anime.image_url);
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                  }}
                />
              ) : (
                <div className="w-24 md:w-32 h-20 md:h-24 bg-slate-700 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
              <div className="fallback-image w-24 md:w-32 h-20 md:h-24 bg-slate-700 flex items-center justify-center hidden">
                <span className="text-gray-500 text-xs">Image Error</span>
              </div>
              <div className="p-3 md:p-4 flex-1">
                <h3 className="font-semibold text-sm md:text-base mb-1">{anime.title}</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                  <Calendar className="w-3 h-3 md:w-4 h-4" />
                  <span>Episode {anime.episodes}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mt-1">
                  <Star className="w-3 h-3 md:w-4 h-4 text-yellow-500 fill-yellow-500" />
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
