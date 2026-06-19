import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Play, Pause, Volume2, Maximize, Settings, ArrowLeft, SkipBack, SkipForward, Heart, Share2, Send, Flag } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { animeAPI, authAPI, reportsAPI } from '../services/api'

// Helper function to extract YouTube video ID
const getYouTubeId = (url) => {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = (match && match[2].length === 11) ? match[2] : null
  console.log('YouTube URL:', url, 'Extracted ID:', videoId)
  return videoId
}

// Helper function to extract Vimeo video ID
const getVimeoId = (url) => {
  if (!url) return null
  const regExp = /vimeo\.com\/(\d+)/
  const match = url.match(regExp)
  const videoId = match ? match[1] : null
  console.log('Vimeo URL:', url, 'Extracted ID:', videoId)
  return videoId
}

export default function Watch() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const episodeId = searchParams.get('episode')
  const [anime, setAnime] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [currentEpisode, setCurrentEpisode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(1440) // 24 minutes in seconds
  const videoRef = useRef(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [reportForm, setReportForm] = useState({
    report_type: 'broken_link',
    description: ''
  })

  useEffect(() => {
    loadAnime()
  }, [id, episodeId])

  const loadAnime = async () => {
    try {
      const [animeData, episodesData] = await Promise.all([
        animeAPI.getById(id),
        animeAPI.getEpisodes(id)
      ])
      setAnime(animeData)
      setEpisodes(episodesData)
      console.log('Episodes loaded:', episodesData)

      // Set current episode
      if (episodeId) {
        const episode = episodesData.find(e => e.id === parseInt(episodeId))
        setCurrentEpisode(episode || episodesData[0])
      } else {
        setCurrentEpisode(episodesData[0])
      }
      console.log('Current episode:', episodesData[0])

      // Load comments for current episode
      loadComments()
    } catch (err) {
      console.error('Failed to load anime:', err)
      // Fallback to mock data if API fails
      const { animeData: mockData } = await import('../data/animeData')
      const mockAnime = mockData.find(a => a.id === parseInt(id))
      if (mockAnime) {
        setAnime(mockAnime)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadComments = () => {
    // Load comments from localStorage for this episode
    const episodeKey = `comments_${id}_${currentEpisode?.id || 1}`
    const savedComments = localStorage.getItem(episodeKey)
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    const user = authAPI.getCurrentUser()
    if (!user) {
      alert('Please login to comment')
      return
    }

    if (!newComment.trim()) {
      alert('Please enter a comment')
      return
    }

    setSubmittingComment(true)
    try {
      const comment = {
        id: Date.now(),
        user_name: user.name || user.email,
        comment: newComment,
        created_at: new Date().toISOString()
      }

      const updatedComments = [...comments, comment]
      setComments(updatedComments)

      // Save to localStorage
      const episodeKey = `comments_${id}_${currentEpisode?.id || 1}`
      localStorage.setItem(episodeKey, JSON.stringify(updatedComments))

      setNewComment('')
      alert('Comment added successfully!')
    } catch (err) {
      console.error('Failed to add comment:', err)
      alert('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    const user = authAPI.getCurrentUser()
    if (!user) {
      alert('Please login to submit a report')
      return
    }

    try {
      await reportsAPI.submit({
        anime_id: parseInt(id),
        episode_id: currentEpisode?.id || null,
        report_type: reportForm.report_type,
        description: reportForm.description
      })
      alert('Report submitted successfully!')
      setShowReportModal(false)
      setReportForm({ report_type: 'broken_link', description: '' })
    } catch (err) {
      alert('Failed to submit report')
      console.error('Error:', err)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const progressBar = e.currentTarget
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth
    if (videoRef.current) {
      videoRef.current.currentTime = clickPosition * duration
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading...</div>
  }

  if (!anime) {
    return <div className="text-center py-20">Anime not found</div>
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / duration) * 100

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Video Player */}
      <div className="relative bg-black aspect-video">
        {currentEpisode && currentEpisode.video_url ? (
          currentEpisode.video_platform === 'youtube' ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${getYouTubeId(currentEpisode.video_url)}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentEpisode.video_platform === 'vimeo' ? (
            <iframe
              className="w-full h-full"
              src={`https://player.vimeo.com/video/${getVimeoId(currentEpisode.video_url)}?autoplay=1`}
              title="Vimeo video player"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={currentEpisode.video_url}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-12 h-12 text-purple-500" />
              </div>
              <p className="text-gray-400">Video Player Placeholder</p>
              <p className="text-sm text-gray-500 mt-2">{anime.title} - Episode {currentEpisode?.episode_number || 1}</p>
              <p className="text-xs text-gray-500 mt-2">Debug: video_url={currentEpisode?.video_url}, platform={currentEpisode?.video_platform}</p>
            </div>
          </div>
        )}

        {/* Controls - Only show for direct video files, not YouTube/Vimeo */}
        {currentEpisode && currentEpisode.video_platform === 'other' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-1 bg-slate-600 rounded-full cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-purple-500 rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                  <SkipBack className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                  <SkipForward className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                  <Settings className="w-6 h-6" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition">
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to={`/anime/${anime.id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
            <p className="text-gray-400 mb-6">Episode 1 - {anime.description}</p>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition">
                <Heart className="w-5 h-5" />
                Add to Favorites
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg transition"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition"
              >
                <Flag className="w-5 h-5" />
                Report
              </button>
            </div>

            {/* Episode List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              <div className="space-y-2">
                {episodes.length > 0 ? (
                  episodes.map((episode) => (
                    <Link
                      key={episode.id}
                      to={`/watch/${anime.id}?episode=${episode.id}`}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg transition ${
                        currentEpisode?.id === episode.id ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">Episode {episode.episode_number}</p>
                        <p className="text-sm text-gray-400">{episode.title || `Episode ${episode.episode_number}`}</p>
                      </div>
                      {currentEpisode?.id === episode.id && <span className="text-sm bg-white/20 px-2 py-1 rounded">Now Playing</span>}
                    </Link>
                  ))
                ) : (
                  Array.from({ length: Math.min(anime.episodes || 12, 10) }, (_, i) => (
                    <Link
                      key={i + 1}
                      to={`/watch/${anime.id}`}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg transition ${
                        i === 0 ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">Episode {i + 1}</p>
                        <p className="text-sm text-gray-400">24:00</p>
                      </div>
                      {i === 0 && <span className="text-sm bg-white/20 px-2 py-1 rounded">Now Playing</span>}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Up Next</h3>
              <div className="space-y-4">
                <p className="text-gray-400 text-center py-8">Up next coming soon</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Comments</h3>
              
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center font-semibold">
                    {authAPI.getCurrentUser()?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="mt-2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex-shrink-0 flex items-center justify-center font-semibold">
                        {comment.user_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{comment.user_name}</p>
                        <p className="text-sm text-gray-400 mt-1">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4 text-sm">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Report Issue</h2>
            <form onSubmit={handleSubmitReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  value={reportForm.report_type}
                  onChange={(e) => setReportForm({ ...reportForm, report_type: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="broken_link">Broken Link</option>
                  <option value="wrong_episode">Wrong Episode</option>
                  <option value="poor_quality">Poor Quality</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Describe the issue..."
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Share {anime?.title}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a
                href={`https://twitter.com/intent/tweet?text=Check out ${anime?.title} on WorldEnd Stream!&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-lg transition"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-3 rounded-lg transition"
              >
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=Check out ${anime?.title} on WorldEnd Stream! ${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Check out ${anime?.title} on WorldEnd Stream!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 px-4 py-3 rounded-lg transition"
              >
                Telegram
              </a>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Copy Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copied to clipboard!')
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
