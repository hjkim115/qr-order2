'use client'

import { useParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useContext } from 'react'
import { getAllCategories, getAllMenus } from '@/app/utils/firebase'
import menusStyles from '../../../styles/menus.module.css'
import { Category, Menu } from '@/app/utils/types'
import { FaShoppingCart } from 'react-icons/fa'
import { CartContext } from '../../../context/CartContext'
import LoadingPage from '@/app/components/LoadingPage'
import { CurrentCategoryContext } from '@/app/context/CurrentCategoryContext'

export default function Menus() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [menus, setMenus] = useState<Menu[] | null>(null)

  const pathName = usePathname()
  const { store, table } = useParams()
  const router = useRouter()

  const { cart, getTotalAmount, getTotalPrice } = useContext(CartContext)
  const { currentCategory, setCurrentCategory } = useContext(
    CurrentCategoryContext
  )

  useEffect(() => {
    async function fetchCategories() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }

      const data = await getAllCategories(store)

      setCategories(data)
    }

    async function fetchMenus() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }

      const data = await getAllMenus(store)

      setMenus(data)
    }

    if (store && table) {
      fetchCategories()
      fetchMenus()
    }
  }, [store, table])

  useEffect(() => {
    if (categories) {
      if (!currentCategory) {
        setCurrentCategory(categories[0])
      }
    }
  }, [categories])

  function changeCategory(category: Category) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentCategory(category)
  }

  function checkCategory(menu: Menu) {
    return currentCategory?.id === menu.category
  }

  return (
    <>
      {categories && menus ? (
        <div className={menusStyles.menusContainer}>
          {/* Categories */}
          <div className={menusStyles.categories}>
            {categories?.map((category, i) => (
              <button
                onClick={() => changeCategory(category)}
                style={
                  currentCategory?.id === category.id
                    ? {
                        color: 'black',
                        borderBottom: 'solid',
                        borderWidth: '2px',
                        fontSize: '1rem',
                      }
                    : undefined
                }
              >
                {category.englishName}
              </button>
            ))}
          </div>

          {/* Menus */}
          <div className={menusStyles.menus}>
            {menus?.filter(checkCategory).map((menu) => (
              <div
                className={menusStyles.menu}
                onClick={() => {
                  router.push(
                    `${pathName}/${menu.id}?category=${menu.category}`
                  )
                }}
              >
                <div
                  style={{
                    backgroundImage: `url('${process.env.NEXT_PUBLIC_CLOUD_FRONT_URL}/${store}/${menu.imageName}')`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                  }}
                  className={menusStyles.menuImage}
                />
                <p>
                  {menu.category}-{menu.id}.{menu.englishName}
                </p>
                <button>Add To Cart</button>
              </div>
            ))}
          </div>

          {/* Cart */}
          <div className={menusStyles.cart}>
            <button
              onClick={() => {
                router.push(`/${store}/${table}/cart`)
              }}
              disabled={cart.length <= 0}
            >
              {cart.length > 0 ? (
                <>
                  <FaShoppingCart size="1rem" /> ×{getTotalAmount()} Total
                  Price: ${getTotalPrice().toFixed(2)}
                </>
              ) : (
                'No items in your cart!'
              )}
            </button>
          </div>
        </div>
      ) : (
        <LoadingPage />
      )}
    </>
  )
}
