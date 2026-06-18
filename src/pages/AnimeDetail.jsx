import { useParams, Link } from 'react-router-dom'
import { Star, Play, Calendar, Clock, ArrowLeft, Heart, Share2, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI, favoritesAPI, authAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || window.location.origin

export default function AnimeDetail() {
  const { id } = useParams()
  const [anime, setAnime] = useState(null)
  const [reviews, setReviews] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadAnime()
  }, [id])

  const loadAnime = async () => {
    try {
      const [animeData, reviewsData, episodesData] = await Promise.all([
        animeAPI.getById(id),
        animeAPI.getReviews(id),
        animeAPI.getEpisodes(id)
      ])
      setAnime(animeData)
      setReviews(reviewsData)
      setEpisodes(episodesData)
    } catch (err) {
      console.error('Failed to load anime:', err)
      // Fallback to mock data if API fails
      const { animeData: mockData } = await import('../data/animeData')
      const mockAnime = mockData.find(a => a.id === parseInt(id))
      if (mockAnime) {
        setAnime(mockAnime)
        setReviews(mockAnime.reviews || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    const user = authAPI.getCurrentUser()
    if (!user) {
      alert('Please login to add favorites')
      return
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(id)
        setIsFavorite(false)
      } else {
        await favoritesAPI.add(id)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Failed to update favorite:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: anime?.title,
        text: anime?.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    const user = authAPI.getCurrentUser()
    if (!user) {
      alert('Please login to submit a review')
      return
    }

    setSubmittingReview(true)
    try {
      await animeAPI.createReview(id, reviewForm.rating, reviewForm.comment)
      setReviewForm({ rating: 5, comment: '' })
      loadAnime() // Reload to show new review
      alert('Review submitted successfully!')
    } catch (err) {
      console.error('Failed to submit review:', err)
      alert('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  if (!anime) {
    return <div className="text-center py-20">Anime not found</div>
  }

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-[400px]">
        {anime.image_url ? (
          <img
            src={`${BACKEND_ORIGIN}${anime.image_url}`}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">{anime.title}</h1>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-xl font-semibold">{anime.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{anime.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{anime.episodes} Episodes</span>
            </div>
            <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">{anime.status}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Link
                to={`/watch/${anime.id}`}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6" />
                Watch Now
              </Link>
              <button
                onClick={handleFavorite}
                className={`p-4 rounded-lg transition ${
                  isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{anime.description}</p>
            </div>

            {/* Genres */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {anime.genres ? anime.genres.split(',').map((genre, index) => (
                  <span key={index} className="px-4 py-2 bg-slate-800 rounded-full text-sm">
                    {genre.trim()}
                  </span>
                )) : (
                  <span className="text-gray-400">No genres specified</span>
                )}
              </div>
            </div>

            {/* Episodes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {episodes.length > 0 ? (
                  episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      to={`/watch/${anime.id}?episode=${episode.id}`}
                      className="bg-slate-800 hover:bg-purple-600 p-3 rounded-lg text-center transition"
                    >
                      {episode.episode_number}
                    </Link>
                  ))
                ) : (
                  Array.from({ length: Math.min(anime.episodes || 12, 24) }, (_, i) => (
                    <Link
                      key={i + 1}
                      to={`/watch/${anime.id}`}
                      className="bg-slate-800 hover:bg-purple-600 p-3 rounded-lg text-center transition"
                    >
                      {i + 1}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              
              {/* Review Form */}
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-2xl transition"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewForm.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your thoughts about this anime..."
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-slate-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-semibold">
                            {review.user_name ? review.user_name[0] : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{review.user_name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span>{anime.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Episodes</span>
                  <span>{anime.episodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Year</span>
                  <span>{anime.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span>{anime.rating}/5</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Related Anime</h3>
              <div className="space-y-4">
                <p className="text-gray-400 text-center py-8">Related anime coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
