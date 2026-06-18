import { Link } from 'react-router-dom'
import { Star, Play, Calendar, User, Clock, Film } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI, authAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function Home() {
  const [animeList, setAnimeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [watchHistory, setWatchHistory] = useState([])

  useEffect(() => {
    loadAnime()
    loadUserInfo()
    loadWatchHistory()
  }, [])

  const loadAnime = async () => {
    try {
      const data = await animeAPI.getAll()
      setAnimeList(data)
    } catch (err) {
      console.error('Failed to load anime:', err)
      const { animeData } = await import('../data/animeData')
      const mappedData = animeData.map(anime => ({
        ...anime,
        image_url: anime.image,
      }))
      setAnimeList(mappedData)
    } finally {
      setLoading(false)
    }
  }

  const loadUserInfo = () => {
    const currentUser = authAPI.getCurrentUser()
    setUser(currentUser)
  }

  const loadWatchHistory = () => {
    const history = localStorage.getItem('watchHistory')
    if (history) {
      setWatchHistory(JSON.parse(history))
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Profile Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
              {user ? (
                user.profile_photo ? (
                  <img src={user.profile_photo.startsWith('http') ? user.profile_photo : `${BACKEND_ORIGIN}${user.profile_photo}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">
                {user ? `Welcome back, ${user.name}!` : 'Welcome to WorldEnd Stream'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {user ? 'Continue watching your favorite anime' : 'Sign in to track your progress'}
              </p>
            </div>
            {user && (
              <Link to="/profile" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition text-sm">
                View Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Watch History Section */}
      {watchHistory.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-6"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Continue Watching
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {watchHistory.slice(0, 10).map((item) => (
                <Link key={item.id} to={`/watch/${item.animeId}?episode=${item.episodeId}`} className="flex-shrink-0 w-48 group">
                  <div className="relative bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${BACKEND_ORIGIN}${item.image}`}
                        alt={item.title}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-28 bg-slate-700 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex items-center gap-2 bg-purple-600/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium">
                        <Play className="w-3 h-3" />
                        Watch
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-xs line-clamp-2 group-hover:text-purple-400 transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">Episode {item.episode}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent my-6"></div>

      {/* Trending Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-purple-500">🔥</span> Trending Now
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {animeList.slice(0, 10).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="flex-shrink-0 w-40 group">
              <div className="relative bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                {anime.image_url ? (
                  <img
                    src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                    alt={anime.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image load error:', anime.image_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : (
                  <div className="w-full h-56 bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <div className="fallback-image w-full h-56 bg-slate-700 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-xs">Image Error</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center gap-2 bg-purple-600/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium">
                    <Play className="w-3 h-3" />
                    Watch
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-xs line-clamp-2 group-hover:text-purple-400 transition-colors">{anime.title}</h3>
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

      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-6"></div>

      {/* Latest Updates Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-purple-500">📺</span> Latest Updates
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {animeList.slice(0, 10).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="flex-shrink-0 w-40 group">
              <div className="relative bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                {anime.image_url ? (
                  <img
                    src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                    alt={anime.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image load error:', anime.image_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : (
                  <div className="w-full h-56 bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <div className="fallback-image w-full h-56 bg-slate-700 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-xs">Image Error</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center gap-2 bg-purple-600/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium">
                    <Play className="w-3 h-3" />
                    Watch
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-xs line-clamp-2 group-hover:text-purple-400 transition-colors">{anime.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Ep {anime.episodes}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent my-6"></div>

      {/* Genre Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-purple-500">🎭</span> Browse by Genre
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Game', 'Harem', 'Historical', 'Horror', 'Josei', 'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological', 'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire'].map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="flex-shrink-0 px-4 py-2 bg-slate-800 hover:bg-purple-600 rounded-full text-xs md:text-sm font-medium transition whitespace-nowrap"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-6"></div>

      {/* Movies Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-500" />
          Movies
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {animeList.filter(anime => anime.type === 'Movie').slice(0, 10).map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`} className="flex-shrink-0 w-40 group">
              <div className="relative bg-slate-800 rounded-xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                {anime.image_url ? (
                  <img
                    src={anime.image_url.startsWith('http') ? anime.image_url : `${BACKEND_ORIGIN}${anime.image_url}`}
                    alt={anime.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image load error:', anime.image_url);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.fallback-image')?.style.setProperty('display', 'flex');
                    }}
                  />
                ) : (
                  <div className="w-full h-56 bg-slate-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <div className="fallback-image w-full h-56 bg-slate-700 flex items-center justify-center hidden">
                  <span className="text-gray-500 text-xs">Image Error</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center gap-2 bg-purple-600/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium">
                    <Play className="w-3 h-3" />
                    Watch
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-xs line-clamp-2 group-hover:text-purple-400 transition-colors">{anime.title}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{anime.rating || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {animeList.filter(anime => anime.type === 'Movie').length === 0 && (
            <p className="text-gray-400 text-sm">No movies available</p>
          )}
        </div>
      </div>
    </div>
  )
}
