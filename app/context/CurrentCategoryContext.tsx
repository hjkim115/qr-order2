'use client'

import { createContext, useState, ReactNode } from 'react'
import { Category } from '../utils/types'

type CurrentCategoryContextType = {
  currentCategory: Category | null
  setCurrentCategory: React.Dispatch<React.SetStateAction<Category | null>>
}

export const CurrentCategoryContext = createContext(
  {} as CurrentCategoryContextType
)

export function CurrentCategoryContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)

  return (
    <CurrentCategoryContext.Provider
      value={{
        currentCategory,
        setCurrentCategory,
      }}
    >
      {children}
    </CurrentCategoryContext.Provider>
  )
}
