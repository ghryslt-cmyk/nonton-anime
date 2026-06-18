import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'

export default function Genre() {
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'
  ]

  const genreColors = {
    'Action': 'from-red-600 to-orange-600',
    'Adventure': 'from-green-600 to-teal-600',
    'Comedy': 'from-yellow-500 to-orange-500',
    'Drama': 'from-purple-600 to-pink-600',
    'Fantasy': 'from-blue-600 to-purple-600',
    'Horror': 'from-gray-800 to-red-900',
    'Mystery': 'from-indigo-600 to-purple-600',
    'Romance': 'from-pink-500 to-red-500',
    'Sci-Fi': 'from-cyan-600 to-blue-600',
    'Slice of Life': 'from-green-500 to-teal-500',
    'Supernatural': 'from-violet-600 to-purple-600',
    'Thriller': 'from-red-700 to-gray-900'
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="WorldEnd Stream" className="w-12 h-12 object-contain" />
            <h1 className="text-5xl font-bold">Browse by Genre</h1>
          </div>
          <p className="text-xl text-gray-300">Find anime by your favorite genre</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="group"
            >
              <div className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br ${genreColors[genre]} hover:scale-105 transition-transform duration-300`}>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white text-center px-4">
                    {genre}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
