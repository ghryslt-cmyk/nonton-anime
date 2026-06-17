import { Link, useNavigate } from 'react-router-dom'
import { Feather, User, Mail, Calendar, Heart, History, Settings, LogOut, Camera, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { userAPI, favoritesAPI, authAPI } from '../services/api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }

    loadProfile()
    loadFavorites()
  }, [navigate])

  const loadProfile = async () => {
    try {
      const data = await userAPI.getProfile()
      setUser(data)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    try {
      const data = await favoritesAPI.getAll()
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    navigate('/')
  }

  const handleEditProfile = () => {
    setEditForm({ name: user.name, email: user.email })
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditForm({ name: '', email: '' })
    setProfilePhoto(null)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Update user in localStorage
      const currentUser = authAPI.getCurrentUser()
      const updatedUser = { ...currentUser, name: editForm.name, email: editForm.email }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : !user ? (
          <div className="text-center py-20">Please login to view your profile</div>
        ) : (
          <>
            <div className="bg-slate-800 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-teal-600 p-2 rounded-full cursor-pointer hover:bg-teal-700 transition">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                      <p className="text-gray-400 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleEditProfile} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition">
                        <Settings className="w-5 h-5" />
                        Edit Profile
                      </button>
                      <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-700 rounded-lg p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-teal-400" />
                  <p className="text-3xl font-bold">{user.favorites_count || 0}</p>
                  <p className="text-gray-400">Favorites</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-6 text-center">
                  <History className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                  <p className="text-3xl font-bold">{user.watched_count || 0}</p>
                  <p className="text-gray-400">Watched</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="text-3xl font-bold">{user.role}</p>
                  <p className="text-gray-400">Role</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-teal-400" />
                  Favorite Anime
                </h2>
                <div className="space-y-4">
                  {favorites.map((anime) => (
                    <Link key={anime.id} to={`/anime/${anime.id}`} className="flex gap-4 bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition">
                      {anime.image_url ? (
                        <img src={`http://localhost:5000${anime.image_url}`} alt={anime.title} className="w-16 h-24 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-24 bg-slate-600 rounded"></div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{anime.title}</h3>
                        <p className="text-sm text-gray-400">{anime.episodes} Episodes</p>
                        <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                          ★ {anime.rating || 0}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {favorites.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No favorites yet</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  Watch History
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-400 text-center py-8">Watch history coming soon</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
