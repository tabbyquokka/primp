import { useState } from 'react'
import { GarmentList } from './components/GarmentList'
import { ScenarioList } from './components/ScenarioList'
import { SettingsScreen } from './components/MySettings'

type Tab = 'wardrobe' | 'scenarios' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('wardrobe')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 pt-3">
          <h1 className="text-xl font-bold text-slate-900">Одёжка</h1>
          <nav className="flex gap-1 mt-3 -mb-px">
            <TabButton active={tab === 'wardrobe'} onClick={() => setTab('wardrobe')}>
              Гардероб
            </TabButton>
            <TabButton active={tab === 'scenarios'} onClick={() => setTab('scenarios')}>
              Сценарии
            </TabButton>
            <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>
              Настройки
            </TabButton>
          </nav>
        </div>
      </header>
      <main className="p-4 pb-24 max-w-md mx-auto">
        {tab === 'wardrobe' && <GarmentList />}
        {tab === 'scenarios' && <ScenarioList />}
        {tab === 'settings' && <SettingsScreen />}
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-2 text-sm font-medium border-b-2 transition ' +
        (active
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-700')
      }
    >
      {children}
    </button>
  )
}

export default App