import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export default function Rewards() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(14250)
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notification, setNotification] = useState('')
  const [notificationType, setNotificationType] = useState('info')
  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Standard Profile Frame', category: 'Digital Item', date: 'Oct 24, 2026', cost: 500 },
    { id: 2, name: 'Early Adopter Badge', category: 'Digital Item', date: 'Sep 12, 2026', cost: 0 },
    { id: 3, name: '1 Month Ad-Free', category: 'Subscription', date: 'Aug 30, 2026', cost: 10000 },
  ])

  const displayName = user?.username 
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1) 
    : 'Alex Rivera'

  const rewardItems = [
    {
      id: 'frames',
      name: 'Exclusive Profile Frames',
      category: 'digital',
      cost: 2500,
      description: 'Stand out from the crowd with animated border effects for your avatar.',
      icon: 'frame_person',
      popular: true,
    },
    {
      id: 'badges',
      name: 'Special Badges',
      category: 'digital',
      cost: 1200,
      description: 'Unique icons displayed next to your username to showcase your achievements.',
      icon: 'verified',
      popular: false,
    },
    {
      id: 'themes',
      name: 'Custom UI Themes',
      category: 'digital',
      cost: 5000,
      description: 'Unlock dark-nord, solarized, and high-contrast professional interface modes.',
      icon: 'palette',
      popular: false,
    },
    {
      id: 'ads',
      name: 'Ad-Free Experience',
      category: 'subscriptions',
      cost: 10000,
      description: 'Remove all advertisements from your feed for 30 consecutive days.',
      icon: 'ad_off',
      popular: false,
    },
    {
      id: 'support',
      name: 'Priority Support',
      category: 'exclusive',
      cost: 8500,
      description: 'Fast-track your tickets with 1-hour guaranteed response time from humans.',
      icon: 'support_agent',
      popular: false,
    },
  ]

  const handleRedeem = (item) => {
    if (balance < item.cost) {
      setNotification(`Falta de estrellas: necesitas ${item.cost} para canjear "${item.name}". Tienes ${balance}.`)
      setNotificationType('error')
      return;
    }

    if (window.confirm(`¿Deseas canjear "${item.name}" por ${item.cost.toLocaleString()} estrellas?`)) {
      setBalance((prev) => prev - item.cost);
      
      const newTransaction = {
        id: Date.now(),
        name: item.name,
        category: item.category === 'digital' ? 'Digital Item' : item.category === 'subscriptions' ? 'Subscription' : 'Exclusive Access',
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        cost: item.cost,
      };

      setTransactions((prev) => [newTransaction, ...prev]);
      setNotification(`¡Recompensa "${item.name}" canjeada con éxito!`)
      setNotificationType('success')
    }
  }

  // Filter items based on active category
  const filteredRewards = activeFilter === 'all'
    ? rewardItems
    : rewardItems.filter((item) => item.category === activeFilter)

  return (
    <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen">
      <div className="flex flex-col gap-8">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-blue-500 font-fill">stars</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Realart Rewards</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAllHistory((open) => !open)}
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Ver Historial"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
            </button>
            <button
              onClick={() => setHelpOpen((open) => !open)}
              className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Ayuda"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className={`rounded-3xl border px-4 py-3 text-sm ${notificationType === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-rose-500 bg-rose-500/10 text-rose-200'} mt-4`}>
            {notification}
          </div>
        )}

        {helpOpen && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 mt-4 text-sm text-slate-200">
            <h2 className="font-semibold text-white mb-2">Soporte rápido</h2>
            <p className="text-slate-400">Si necesitas ayuda, revisa tu inventario o contacta al apoyo de Realart. Aquí puedes canjear recompensas, ver tus transacciones y cambiar tu estado.</p>
          </div>
        )}

        {/* Dashboard Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Status */}
          <div className="flex flex-col gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xl uppercase">
                {displayName[0]}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-white">{displayName}</h3>
                <p className="text-slate-400 text-xs">Miembro Pro desde 2024</p>
              </div>
            </div>
            <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">75% para el próximo nivel</p>
          </div>

          {/* Available Balance */}
          <div className="flex flex-col justify-center p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Saldo Disponible</p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 font-fill text-2xl">stars</span>
              <h4 className="text-3xl font-bold tracking-tight text-white">{balance.toLocaleString()}</h4>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Estrellas totales obtenidas: 42,500</p>
          </div>

          {/* Standing Tier */}
          <div className="flex flex-col justify-center p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">Rango en Comunidad</p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 font-fill text-2xl">workspace_premium</span>
              <h4 className="text-3xl font-bold tracking-tight text-white uppercase">Silver Elite</h4>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Top 5% de los mejores contribuidores</p>
          </div>
        </section>

        {/* Filter Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
          {[
            { id: 'all', label: 'Todas las Recompensas' },
            { id: 'digital', label: 'Objetos Digitales' },
            { id: 'subscriptions', label: 'Suscripciones' },
            { id: 'exclusive', label: 'Acceso Exclusivo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                activeFilter === tab.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/25'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden hover:border-slate-700 transition-all duration-200"
            >
              <div className="h-40 bg-slate-900 flex items-center justify-center relative border-b border-slate-800">
                <span className="material-symbols-outlined text-5xl text-slate-500 group-hover:scale-110 transition-transform duration-300">
                  {reward.icon}
                </span>
                {reward.popular && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
                    Popular
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col grow">
                <h5 className="font-bold text-sm text-white mb-1.5">{reward.name}</h5>
                <p className="text-slate-400 text-xs mb-5 leading-relaxed">{reward.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-yellow-500 font-fill text-sm">stars</span>
                    <span className="font-bold text-white text-sm">{reward.cost.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    className="px-4 py-2 rounded bg-slate-800 border border-slate-700 text-slate-200 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-xs font-bold uppercase transition-all duration-200"
                  >
                    Canjear
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction History Section */}
        <section className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold tracking-tight text-white">Historial de Transacciones</h3>
            <a
              onClick={(e) => { e.preventDefault(); setShowAllHistory((open) => !open); }}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest hover:underline cursor-pointer"
              href="#"
            >
              {showAllHistory ? 'Ocultar' : 'Ver Todo'}
            </a>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/20">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Objeto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-200">{tx.name}</td>
                    <td className="px-4 py-4 text-slate-400">{tx.category}</td>
                    <td className="px-4 py-4 text-slate-400">{tx.date}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-200">
                      {tx.cost.toLocaleString()} <span className="text-[9px] text-slate-500">STARS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showAllHistory && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-slate-300 text-sm">
              <p className="mb-2 font-semibold text-white">Historial extendido</p>
              <p>Mostrando las transacciones recientes y los premios canjeados. Puedes seguir canjeando para actualizar tu saldo y ver nuevas entradas aquí.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
