import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'

export default function Genre() {
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem',
    'Historical', 'Horror', 'Josei', 'Magic', 'Martial Arts', 'Mecha', 'Military',
    'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai',
    'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Slice of Life',
    'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire'
  ]

  const genreColors = {
    'Action': 'from-red-600 to-orange-600',
    'Adventure': 'from-orange-600 to-yellow-600',
    'Comedy': 'from-yellow-600 to-green-600',
    'Drama': 'from-green-600 to-teal-600',
    'Ecchi': 'from-pink-600 to-red-600',
    'Fantasy': 'from-purple-600 to-pink-600',
    'Game': 'from-blue-600 to-cyan-600',
    'Harem': 'from-pink-500 to-purple-500',
    'Historical': 'from-amber-700 to-orange-700',
    'Horror': 'from-gray-800 to-red-900',
    'Josei': 'from-pink-400 to-rose-400',
    'Magic': 'from-violet-600 to-purple-600',
    'Martial Arts': 'from-red-700 to-orange-700',
    'Mecha': 'from-blue-700 to-cyan-700',
    'Military': 'from-gray-700 to-slate-700',
    'Music': 'from-purple-500 to-pink-500',
    'Mystery': 'from-indigo-600 to-purple-600',
    'Parody': 'from-yellow-500 to-orange-500',
    'Police': 'from-blue-600 to-indigo-600',
    'Psychological': 'from-purple-800 to-pink-800',
    'Romance': 'from-pink-500 to-red-500',
    'Samurai': 'from-red-800 to-orange-800',
    'School': 'from-blue-500 to-cyan-500',
    'Sci-Fi': 'from-cyan-600 to-blue-600',
    'Seinen': 'from-slate-600 to-gray-600',
    'Shoujo': 'from-pink-400 to-purple-400',
    'Shoujo Ai': 'from-pink-300 to-rose-300',
    'Shounen': 'from-blue-400 to-indigo-400',
    'Slice of Life': 'from-green-500 to-teal-500',
    'Space': 'from-indigo-600 to-blue-600',
    'Sports': 'from-orange-500 to-red-500',
    'Super Power': 'from-yellow-500 to-orange-500',
    'Supernatural': 'from-violet-600 to-purple-600',
    'Thriller': 'from-red-700 to-gray-900',
    'Vampire': 'from-red-900 to-purple-900'
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="WorldEnd Stream" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <h1 className="text-2xl md:text-4xl font-bold">Browse by Genre</h1>
          </div>
          <p className="text-base md:text-lg text-gray-300">Find anime by your favorite genre</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="group"
            >
              <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${genreColors[genre]} hover:scale-[1.02] transition-transform duration-300`}>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white text-center px-4">
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
