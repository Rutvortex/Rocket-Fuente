import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { apiService } from '../services/api'

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const userId = user?.id || user?._id

  useEffect(() => {
    const fetchUserAchievements = async () => {
      if (!userId) return
      try {
        setLoading(true)
        const response = await apiService.getUserAchievements(userId)
        setAchievements(response.data || [])
      } catch (error) {
        console.error('Error fetching user achievements:', error)
        setAchievements([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserAchievements()
  }, [userId])

  return (
    <main className="flex-1 max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Logros
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-500">
            Cargando logros...
          </div>
        ) : achievements.length > 0 ? (
          achievements.map((achievement) => (
            <div
              key={achievement._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-4xl mb-3">
                {achievement.icon ? (
                  achievement.icon.startsWith('http') || achievement.icon.startsWith('/') ? (
                    <img src={achievement.icon} alt={achievement.name} className="mx-auto h-10 w-10" />
                  ) : (
                    <span className="material-symbols-outlined">{achievement.icon}</span>
                  )
                ) : (
                  '🏆'
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                {achievement.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {achievement.description}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-500">
            No hay logros desbloqueados todavía. Publica contenido o interactúa para conseguir tus primeros logros.
          </div>
        )}
      </div>
    </main>
  )
}
