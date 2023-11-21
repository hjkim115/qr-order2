'use client'

import { useParams, usePathname } from 'next/navigation'
import homeStyles from '../../styles/home.module.css'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { store, table } = useParams()
  const pathName = usePathname()
  return (
    <div className={homeStyles.homeContainer}>
      <div>
        <img
          src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_URL}/${store}/logo.png`}
          width={200}
          alt="logo"
        />
        <p>Table: {table}</p>
      </div>
      <Link href={`${pathName}/menus`}>ORDER NOW</Link>
      <p className={homeStyles.footer}>Powered by BS2</p>
    </div>
  )
}
