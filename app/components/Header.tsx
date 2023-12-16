'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'
import { FaHome } from 'react-icons/fa'
import headerStyles from '../styles/header.module.css'
import Loading from './Loading'
import { SettingsContext } from '../context/SettingsContext'

export default function Header() {
  const { store, table } = useParams()
  const pathName = usePathname()
  const router = useRouter()
  const baseUrl = `/${store}/${table}`

  const { settings } = useContext(SettingsContext)
  const companyName = settings?.name

  return (
    <div className={headerStyles.headerContainer}>
      {companyName ? (
        <p>{companyName}</p>
      ) : (
        <div className={headerStyles.loading}>
          {' '}
          <Loading size="1.25rem" />
        </div>
      )}
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
