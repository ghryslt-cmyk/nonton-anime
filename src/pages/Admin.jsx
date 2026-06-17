import { Link, useNavigate } from 'react-router-dom'
import { Feather, Upload, Film, Users, Settings, LogOut, Plus, Edit, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { animeAPI, userAPI, settingsAPI, authAPI } from '../services/api'

const BACKEND_ORIGIN = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin)

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedAnime, setSelectedAnime] = useState(null)
  const [episodeForm, setEpisodeForm] = useState({
    episode_number: '',
    title: '',
    video_url: '',
    video_platform: 'youtube'
  })
  const [animeData, setAnimeData] = useState({
    title: '',
    description: '',
    genres: '',
    year: '',
    episodes: '',
    status: 'Ongoing',
    image: null,
    video_url: '',
    video_platform: 'youtube'
  })
  const [animeList, setAnimeList] = useState([])
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState({ admin_email_domain: '@worldend.com', max_video_size_mb: '2048' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = authAPI.getCurrentUser()
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    loadAnimeList()
    loadUsers()
    loadSettings()
  }, [navigate])

  const loadAnimeList = async () => {
    try {
      const data = await animeAPI.getAll()
      setAnimeList(data)
    } catch (err) {
      console.error('Failed to load anime:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const loadSettings = async () => {
    try {
      const data = await settingsAPI.get()
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleInputChange = (e) => {
    setAnimeData({
      ...animeData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (e) => {
    setAnimeData({
      ...animeData,
      image: e.target.files[0]
    })
  }

  const handleVideoUpload = (e) => {
    setAnimeData({
      ...animeData,
      video_url: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', animeData.title)
      formData.append('description', animeData.description)
      formData.append('genres', animeData.genres)
      formData.append('year', animeData.year)
      formData.append('episodes', animeData.episodes)
      formData.append('status', animeData.status)
      formData.append('video_url', animeData.video_url)
      formData.append('video_platform', animeData.video_platform)
      if (animeData.image) {
        formData.append('image', animeData.image)
      }

      await animeAPI.create(formData)
      alert('Anime uploaded successfully!')
      setAnimeData({
        title: '',
        description: '',
        genres: '',
        year: '',
        episodes: '',
        status: 'Ongoing',
        image: null,
        video_url: '',
        video_platform: 'youtube'
      })
      loadAnimeList()
    } catch (err) {
      setError(err.message || 'Failed to upload anime')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnime = async (id) => {
    if (!confirm('Are you sure you want to delete this anime?')) return

    try {
      await animeAPI.delete(id)
      alert('Anime deleted successfully!')
      loadAnimeList()
    } catch (err) {
      alert('Failed to delete anime: ' + (err.message || 'Unknown error'))
      console.error('Delete error:', err)
    }
  }

  const handleAddEpisode = async (animeId) => {
    if (!episodeForm.episode_number || !episodeForm.video_url) {
      alert('Please fill in episode number and video URL')
      return
    }

    try {
      const data = {
        episode_number: parseInt(episodeForm.episode_number),
        title: episodeForm.title,
        video_url: episodeForm.video_url,
        video_platform: episodeForm.video_platform
      }
      await animeAPI.createEpisode(animeId, data)
      alert('Episode added successfully!')
      setEpisodeForm({
        episode_number: '',
        title: '',
        video_url: '',
        video_platform: 'youtube'
      })
      // Reload episodes for selected anime
      if (selectedAnime && selectedAnime.id === animeId) {
        const episodes = await animeAPI.getEpisodes(animeId)
        setSelectedAnime({ ...selectedAnime, episodes })
      }
    } catch (err) {
      alert(err.message || 'Failed to add episode')
      console.error('Error:', err)
    }
  }

  const handleSelectAnimeForEpisodes = async (anime) => {
    setSelectedAnime(anime)
    setActiveTab('episodes')
    try {
      const episodes = await animeAPI.getEpisodes(anime.id)
      setSelectedAnime({ ...anime, episodes })
    } catch (err) {
      console.error('Failed to load episodes:', err)
      setSelectedAnime({ ...anime, episodes: [] })
    }
  }

  const handleSettingsUpdate = async () => {
    try {
      await settingsAPI.update(settings)
      alert('Settings updated successfully!')
    } catch (err) {
      alert('Failed to update settings')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-slate-800 rounded-lg p-4 space-y-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  activeTab === 'upload' ? 'bg-teal-600' : 'hover:bg-slate-700'
                }`}
              >
                <Upload className="w-4 h-4 md:w-5 h-5" />
                Upload Anime
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  activeTab === 'manage' ? 'bg-teal-600' : 'hover:bg-slate-700'
                }`}
              >
                <Film className="w-4 h-4 md:w-5 h-5" />
                Manage Anime
              </button>
              <button
                onClick={() => setActiveTab('episodes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  activeTab === 'episodes' ? 'bg-teal-600' : 'hover:bg-slate-700'
                }`}
              >
                <Plus className="w-4 h-4 md:w-5 h-5" />
                Manage Episodes
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  activeTab === 'users' ? 'bg-teal-600' : 'hover:bg-slate-700'
                }`}
              >
                <Users className="w-4 h-4 md:w-5 h-5" />
                Manage Users
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm md:text-base ${
                  activeTab === 'settings' ? 'bg-teal-600' : 'hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 md:w-5 h-5" />
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'upload' && (
              <div className="bg-slate-800 rounded-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 md:w-6 h-6" />
                  Upload New Anime
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-medium mb-2">Anime Title</label>
                      <input
                        type="text"
                        name="title"
                        value={animeData.title}
                        onChange={handleInputChange}
                        placeholder="Enter anime title"
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium mb-2">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={animeData.year}
                        onChange={handleInputChange}
                        placeholder="Release year"
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={animeData.description}
                      onChange={handleInputChange}
                      placeholder="Enter anime description"
                      rows="4"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-medium mb-2">Genres (comma separated)</label>
                      <input
                        type="text"
                        name="genres"
                        value={animeData.genres}
                        onChange={handleInputChange}
                        placeholder="Action, Fantasy, Romance"
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium mb-2">Number of Episodes</label>
                      <input
                        type="number"
                        name="episodes"
                        value={animeData.episodes}
                        onChange={handleInputChange}
                        placeholder="Total episodes"
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={animeData.status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Cover Image</label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-teal-500 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-400 text-sm md:text-base">
                          {animeData.image ? animeData.image.name : 'Click to upload cover image'}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Video Platform</label>
                    <select
                      value={animeData.video_platform}
                      onChange={(e) => setAnimeData({ ...animeData, video_platform: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="other">Other (Direct URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Video URL</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={animeData.video_url}
                      onChange={handleVideoUpload}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                      {animeData.video_platform === 'youtube' ? 'Paste YouTube video URL' : 
                       animeData.video_platform === 'vimeo' ? 'Paste Vimeo video URL' : 
                       'Paste direct video URL'}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    <Upload className="w-4 h-4 md:w-5 h-5" />
                    {loading ? 'Uploading...' : 'Upload Anime'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="bg-slate-800 rounded-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Film className="w-5 h-5 md:w-6 h-6" />
                  Manage Anime
                </h2>
                <div className="space-y-4">
                  {animeList.map((anime) => (
                    <div key={anime.id} className="bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {anime.image_url ? (
                          <img src={`${BACKEND_ORIGIN}${anime.image_url}`} alt={anime.title} className="w-12 h-16 md:w-16 md:h-24 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 md:w-16 md:h-24 bg-slate-600 rounded"></div>
                        )}
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">{anime.title}</h3>
                          <p className="text-xs md:text-sm text-gray-400">{anime.episodes} Episodes • {anime.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => handleSelectAnimeForEpisodes(anime)} className="flex-1 md:flex-none p-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition">
                          <Plus className="w-4 h-4 md:w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteAnime(anime.id)} className="flex-1 md:flex-none p-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                          <Trash2 className="w-4 h-4 md:w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {animeList.length === 0 && (
                    <p className="text-gray-400 text-center py-8 text-sm md:text-base">No anime uploaded yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'episodes' && (
              <div className="bg-slate-800 rounded-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 md:w-6 h-6" />
                  Manage Episodes
                </h2>
                
                {selectedAnime ? (
                  <>
                    <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold text-sm md:text-base mb-2">{selectedAnime.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400">Managing episodes for this anime</p>
                    </div>

                    {/* Add Episode Form */}
                    <div className="mb-8 p-6 bg-slate-700 rounded-lg">
                      <h3 className="font-semibold mb-4 text-sm md:text-base">Add New Episode</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">Episode Number</label>
                          <input
                            type="number"
                            value={episodeForm.episode_number}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                            placeholder="1"
                            className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            value={episodeForm.title}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                            placeholder="Episode 1"
                            className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">Video Platform</label>
                          <select
                            value={episodeForm.video_platform}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, video_platform: e.target.value })}
                            className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          >
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="other">Other (Direct URL)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-2">Video URL</label>
                          <input
                            type="url"
                            value={episodeForm.video_url}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddEpisode(selectedAnime.id)}
                        className="mt-4 bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg transition text-sm"
                      >
                        Add Episode
                      </button>
                    </div>

                    {/* Episodes List */}
                    <div>
                      <h3 className="font-semibold mb-4 text-sm md:text-base">Existing Episodes</h3>
                      {selectedAnime.episodes && selectedAnime.episodes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedAnime.episodes.map((episode) => (
                            <div key={episode.id} className="bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <p className="font-semibold text-sm md:text-base">Episode {episode.episode_number}: {episode.title || 'Untitled'}</p>
                                <p className="text-xs md:text-sm text-gray-400 break-all">{episode.video_platform} • {episode.video_url}</p>
                              </div>
                              <span className="px-3 py-1 bg-teal-600 rounded-full text-xs whitespace-nowrap">
                                {episode.video_platform}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-8 text-sm">No episodes yet</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4 text-sm md:text-base">Select an anime from Manage Anime to add episodes</p>
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded-lg transition text-sm"
                    >
                      Go to Manage Anime
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-slate-800 rounded-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 md:w-6 h-6" />
                  Manage Users
                </h2>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-600 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm md:text-base">{user.email}</h3>
                          <p className="text-xs md:text-sm text-gray-400">{user.role}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${user.role === 'admin' ? 'bg-teal-600' : 'bg-green-600'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-gray-400 text-center py-8 text-sm">No users registered yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-slate-800 rounded-lg p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 md:w-6 h-6" />
                  Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Admin Email Domain</label>
                    <input
                      type="text"
                      value={settings.admin_email_domain}
                      onChange={(e) => setSettings({ ...settings, admin_email_domain: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                    <p className="text-xs md:text-sm text-gray-400 mt-2">Users with this email domain will be registered as admins</p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-2">Max Video Size (MB)</label>
                    <input
                      type="number"
                      value={settings.max_video_size_mb}
                      onChange={(e) => setSettings({ ...settings, max_video_size_mb: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <button onClick={handleSettingsUpdate} className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg font-semibold transition text-sm">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
