'use client'

import { useContext } from 'react'
import { useParams, usePathname } from 'next/navigation'
import homeStyles from '../../styles/home.module.css'
import Link from 'next/link'
import { SettingsContext } from '@/app/context/SettingsContext'

export default function Home() {
  const { store, table } = useParams()
  const pathName = usePathname()

  const { settings } = useContext(SettingsContext)
  const logoImageName = settings?.logoImageName

  return (
    <div className={homeStyles.homeContainer}>
      <div>
        <img
          src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_URL}/${store}/${logoImageName}`}
          width={200}
          alt="logo"
        />
        <p>Table: {table}</p>
      </div>
      <Link href={`${pathName}/menus`}>ORDER NOW</Link>
      <p className={homeStyles.footer}>Developed by hjkim</p>
    </div>
  )
}
