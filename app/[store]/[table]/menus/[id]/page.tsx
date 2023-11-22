'use client'

import { useEffect, useState, useContext } from 'react'
import detailsStyles from '../../../../styles/details.module.css'
import { Menu, Option, Options } from '@/app/utils/types'
import { getMenu, getOptions } from '@/app/utils/firebase'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CartContext } from '../../../../context/CartContext'
import LoadingPage from '@/app/components/LoadingPage'

export default function Menu() {
  const [menu, setMenu] = useState<Menu | null>(null)
  const [options, setOptions] = useState<Options | null>(null)
  const [amount, setAmount] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<(Option | null)[]>([])

  const { store, table, id } = useParams()
  const category = useSearchParams().get('category')
  const router = useRouter()

  const { cart, addItem, addAmount } = useContext(CartContext)

  useEffect(() => {
    async function fetchMenu() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }
      if (typeof category !== 'string') {
        throw Error('Type of category should be string!')
      }
      if (typeof id !== 'string') {
        throw Error('Type of id should be string!')
      }

      const data = await getMenu(store, category, id)
      setMenu(data)
    }

    async function fetchOptions() {
      if (typeof store !== 'string') {
        throw Error('Type of store should be string!')
      }
      if (typeof category !== 'string') {
        throw Error('Type of category should be string!')
      }
      if (typeof id !== 'string') {
        throw Error('Type of id should be string!')
      }

      const data = await getOptions(store, category, id)
      setOptions(data)
    }

    if (store && category && id) {
      fetchMenu()
      fetchOptions()
    }
  }, [store, category, id])

  useEffect(() => {
    if (options) {
      const defaultOptions = []
      for (let i = 0; i < Object.keys(options).length; i++) {
        defaultOptions.push(null)
      }

      setSelectedOptions(defaultOptions)
    }
  }, [options])

  function handleOptionsChange(key: string, optionsIndex: string) {
    if (!options) {
      throw Error('Options is not set!')
    }

    const selectedOptionsIndex = Object.keys(options).indexOf(key)
    const newSelectedOptions = [...selectedOptions]

    if (optionsIndex === '') {
      newSelectedOptions[selectedOptionsIndex] = null
    } else {
      newSelectedOptions[selectedOptionsIndex] =
        options[key][Number(optionsIndex)]
    }

    setSelectedOptions(newSelectedOptions)
  }

  function addToCart() {
    if (!menu) {
      throw Error('Menu is not set!')
    }

    if (selectedOptions.includes(null)) {
      alert('Make sure that you selected all required options!')
      return
    }

    let hasItem = false
    let i
    for (i = 0; i < cart.length; i++) {
      const item = cart[i]

      if (item.menu.id === menu.id && item.menu.category === menu.category) {
        let isOptionEqual = true

        for (let j = 0; j < selectedOptions.length; j++) {
          const selectedOption = selectedOptions[j]
          const itemOption = item.options[j]

          if (selectedOption == null || itemOption == null) {
            if (selectedOption != itemOption) {
              isOptionEqual = false
              break
            }
          } else {
            if (selectedOption.id !== itemOption.id) {
              isOptionEqual = false
              break
            }
          }
        }

        if (isOptionEqual) {
          hasItem = true
          break
        }
      }
    }

    if (hasItem) {
      addAmount(i, amount)
    } else {
      addItem({
        menu: menu,
        amount: amount,
        options: selectedOptions,
      })
    }

    router.push(`/${store}/${table}/menus`)
  }

  function getUnitPrice() {
    if (!menu) {
      throw Error('Menu is not set!')
    }

    let unitPrice = menu.price

    for (const option of selectedOptions) {
      if (option) {
        unitPrice += option.price
      }
    }

    return Math.round(unitPrice * 100) / 100
  }

  return (
    <>
      {menu && options ? (
        <div className={detailsStyles.detailsContainer}>
          {/* Name*/}
          <h1>
            {menu.category}-{menu.id}.{menu.englishName}
          </h1>

          {/* Image */}
          <div
            style={{
              backgroundImage: `url('${process.env.NEXT_PUBLIC_CLOUD_FRONT_URL}/${store}/${menu.imageName}')`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              width: '80%',
              height: '30vh',
            }}
          />

          {/* Amount */}
          <div className={detailsStyles.amount}>
            <p>
              Unit Price: ${getUnitPrice().toFixed(2)} <span>× {amount}</span>
            </p>
            <div>
              <button
                disabled={amount <= 1}
                onClick={() => setAmount(amount - 1)}
              >
                ▼
              </button>
              <button onClick={() => setAmount(amount + 1)}>▲</button>
            </div>
          </div>

          {/* Price */}
          <p className={detailsStyles.price}>
            ${(Math.round(amount * getUnitPrice() * 100) / 100).toFixed(2)}
          </p>

          {/* Options */}
          {Object.keys(options).length > 0 ? (
            <div className={detailsStyles.options}>
              {Object.keys(options).map((key) => (
                <>
                  <p>{key}</p>
                  <select
                    onChange={(e) => handleOptionsChange(key, e.target.value)}
                  >
                    <option value="">Select {key}!</option>
                    {options[key].map((option, i) => (
                      <option value={i}>
                        {option.englishName} (++${option.price})
                      </option>
                    ))}
                  </select>
                </>
              ))}
            </div>
          ) : null}

          {/* Descripton */}
          {menu.description ? (
            <p className={detailsStyles.description}>
              <span>Description: </span>
              {menu.description}
            </p>
          ) : null}

          {/* Buttons */}
          <div className={detailsStyles.buttons}>
            <Link href={`/${store}/${table}/menus`}>{'<<'}Go Back</Link>
            <button onClick={addToCart}>Add To Cart</button>
          </div>
        </div>
      ) : (
        <LoadingPage />
      )}
    </>
  )
}
