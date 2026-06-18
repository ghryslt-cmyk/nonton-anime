import { Link } from 'react-router-dom'
import { Play, Star, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function JadwalRilis() {
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

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  
  // Group anime by release day (random assignment for demo)
  const animeByDay = days.reduce((acc, day, index) => {
    acc[day] = animeList.filter((_, i) => i % 7 === index)
    return acc
  }, {})

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
            <h1 className="text-2xl md:text-4xl font-bold">Jadwal Rilis</h1>
          </div>
          <p className="text-base md:text-lg text-gray-300">Jadwal tayang anime on-going</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {days.map((day) => (
          <div key={day} className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              {day}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {animeByDay[day].length > 0 ? (
                animeByDay[day].map((anime) => (
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
                ))
              ) : (
                <p className="text-gray-400 text-sm">Tidak ada anime yang tayang hari ini</p>
              )}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent my-6"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
