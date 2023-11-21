'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { getAllTables } from '@/app/utils/firebase'
import { Table } from '@/app/utils/types'
import { CartContextProvider } from '@/app/context/CartContext'
import { CurrentCategoryContextProvider } from '@/app/context/CurrentCategoryContext'

export default function QrOrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tables, setTables] = useState<Table[] | null>(null)
  const { store, table } = useParams()

  useEffect(() => {
    async function fetchTables() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }

      const data = await getAllTables(store)
      setTables(data)
    }

    if (store) {
      fetchTables()
    }
  }, [store])

  function isValidTable() {
    if (tables !== null) {
      for (const t of tables) {
        if (t.tableNumber === table) {
          return true
        }
      }
    }

    return false
  }

  return (
    <section>
      {isValidTable() ? (
        <CartContextProvider>
          <CurrentCategoryContextProvider>
            <Header />
            {children}
          </CurrentCategoryContextProvider>
        </CartContextProvider>
      ) : null}
    </section>
  )
}
