import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { useAuth } from '../context/useAuth'

export default function MainHub() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [image, setImage] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('info')
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPosts()
      setPosts(response.data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    const trimmedContent = newPost.trim()

    if (!trimmedContent && !imageDataUrl) {
      setStatusMessage('Debes escribir texto o seleccionar una imagen para publicar.')
      setStatusType('warning')
      return
    }

    try {
      const payload = {}
      if (trimmedContent) payload.content = trimmedContent
      if (imageDataUrl) payload.image = imageDataUrl

      await apiService.createPost(payload)
      setNewPost('')
      setImage(null)
      setImageDataUrl(null)
      fetchPosts()
      setStatusMessage('Publicación creada con éxito.')
      setStatusType('success')
    } catch (error) {
      console.error('Error creating post:', error)
      if (error.response && error.response.data) {
        setStatusMessage(error.response.data.message || 'Error del servidor al crear el post.')
      } else {
        setStatusMessage('No se pudo crear el post. Intenta nuevamente más tarde.')
      }
      setStatusType('error')
    }
  }

  const handleLike = async (postId) => {
    if (!user) {
      setStatusMessage('Debes iniciar sesión para dar like.')
      setStatusType('warning')
      return
    }

    try {
      await apiService.likePost(postId)
      fetchPosts()
      setStatusMessage('Star agregado correctamente al post.')
      setStatusType('success')
    } catch (error) {
      console.error('Error liking post:', error)
      setStatusMessage('No se pudo actualizar el like. Intenta más tarde.')
      setStatusType('error')
    }
  }

  return (
  <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid lg:grid-cols-1 gap-6 px-4 py-6 max-w-7xl mx-auto">
        <main className="space-y-6">
          <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bienvenido</p>
              <h1 className="text-3xl font-bold">Explora tu feed</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800/70">
                Buscar
              </button>
              <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-500">
                Crear nuevo post
              </button>
            </div>
          </header>

          {statusMessage && (
            <div className={`rounded-3xl border px-4 py-3 ${statusType === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : statusType === 'warning' ? 'border-amber-500 bg-amber-500/10 text-amber-200' : 'border-red-500 bg-red-500/10 text-red-200'}`}>
              {statusMessage}
            </div>
          )}

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm text-slate-400">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-slate-500">Comparte algo con la comunidad.</p>
              </div>
            </div>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="¿Qué está en tu mente?"
                rows="4"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              {imageDataUrl && (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                  <img
                    src={imageDataUrl}
                    alt="Preview"
                    className="w-full rounded-2xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null)
                      setImageDataUrl(null)
                    }}
                    className="mt-3 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                  >
                    Remover imagen
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 hover:border-blue-500 hover:text-white cursor-pointer">
                  <span className="material-symbols-outlined">image</span>
                  Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setImage(file)
                          setImageDataUrl(reader.result)
                        }
                        reader.readAsDataURL(file)
                      } else {
                        setImage(null)
                        setImageDataUrl(null)
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!newPost.trim() && !imageDataUrl}
                  className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Publicar
                </button>
              </div>
              {!newPost.trim() && !imageDataUrl && (
                <p className="text-xs text-slate-500">Debes escribir texto o seleccionar una imagen para publicar.</p>
              )}
            </form>
          </section>

          <section className="space-y-4">
            {loading ? (
              <div className="text-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-500">
                Cargando posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-slate-500">
                No hay posts aún
              </div>
            ) : (
              posts.map((post) => (
                <article key={post._id} className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-800 text-base font-bold">
                      {post.author?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{post.author?.username || 'Usuario'}</p>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm leading-relaxed text-slate-300">{post.content}</p>
                  </div>
                  {post.image && (
                    <div
                      className="h-64 bg-cover bg-center"
                      style={{ backgroundImage: `url('${post.image}')` }}
                    />
                  )}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-slate-800 text-slate-400">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-slate-950/80 hover:bg-slate-900"
                    >
                      <span className="material-symbols-outlined">star</span>
                      <span>{post.stars || 0} stars</span>
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
