'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FaHome } from 'react-icons/fa'
import { getCompanyName } from '../utils/firebase'
import headerStyles from '../styles/header.module.css'

export default function Header() {
  const [companyName, setCompanyName] = useState<string | null>(null)

  const { store, table } = useParams()
  const pathName = usePathname()
  const router = useRouter()
  const baseUrl = `/${store}/${table}`

  useEffect(() => {
    async function fetchCompanyName() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }
      const data = await getCompanyName(store)
      setCompanyName(data)
    }

    if (store) {
      fetchCompanyName()
    }
  }, [store])

  return (
    <div className={headerStyles.headerContainer}>
      <p>{companyName}</p>
      {pathName !== baseUrl ? (
        <FaHome
          onClick={() => router.push(baseUrl)}
          className={headerStyles.home}
          size="1.25rem"
        />
      ) : null}
    </div>
  )
}
