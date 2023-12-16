'use client'

import { createContext, useState, ReactNode, useEffect } from 'react'
import { getSettings } from '../utils/firebase'
import { Settings } from '../utils/types'
import { useParams } from 'next/navigation'

type SettingsContextType = {
  settings: Settings | null
  setSettings: React.Dispatch<React.SetStateAction<Settings | null>>
}

export const SettingsContext = createContext({} as SettingsContextType)

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)

  const { store } = useParams()

  useEffect(() => {
    async function fetchSettings(store: string) {
      const data = await getSettings(store)
      setSettings(data)
    }

    if (store) {
      fetchSettings(store as string)
    }
  }, [store])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
