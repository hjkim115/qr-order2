'use client'

import { useState, useContext } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CartContext } from '../../../context/CartContext'
import cartStyles from '../../../styles/cart.module.css'
import { Item, OrderDetail, OrderHeader } from '@/app/utils/types'
import Link from 'next/link'
import {
  getLastOrderIdOrNull,
  postOrderHeader,
  postOrderDetails,
} from '@/app/utils/firebase'
import Loading from '@/app/components/Loading'
import { CurrentCategoryContext } from '@/app/context/CurrentCategoryContext'

export default function Cart() {
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Placed' | null>(
    null
  )
  const [placedOrder, setPlacedOrder] = useState<Item[] | null>(null)
  const [placedOrderPrice, setPlacedOrderPrice] = useState<number | null>(null)

  const {
    cart,
    decreaseAmount,
    increaseAmount,
    deleteItem,
    getTotalPrice,
    clear,
  } = useContext(CartContext)
  const { setCurrentCategory } = useContext(CurrentCategoryContext)
  const router = useRouter()
  const { store, table } = useParams()

  function getUnitPrice(item: Item) {
    let unitPrice = item.menu.price

    for (const option of item.options) {
      if (option) {
        unitPrice += option.price
      }
    }

    return Math.round(unitPrice * 100) / 100
  }

  function getItemPrice(price: number, amount: number) {
    return Math.round(price * amount * 100) / 100
  }

  function handleDelete(index: number) {
    deleteItem(index)
    if (cart.length === 1) {
      router.push(`/${store}/${table}/menus`)
    }
  }

  async function placeOrder() {
    if (typeof store !== 'string') {
      throw Error('Type of store should be string!')
    }
    if (typeof table !== 'string') {
      throw Error('Type of table should be string!')
    }

    //Pending...
    setOrderStatus('Pending')
    setPlacedOrder(cart)
    setPlacedOrderPrice(getTotalPrice())

    //Last Order Id
    const lastId = await getLastOrderIdOrNull(store)

    //Date
    const dateString = new Date().toLocaleDateString('en-SG', {
      dateStyle: 'short',
    })
    const dateArray = dateString.split('/')
    const year = dateArray[2]
    const month = dateArray[1]
    const day = dateArray[0]

    const date = `${year}${month.length < 2 ? '0' + month : month}${
      day.length < 2 ? '0' + day : day
    }`

    //Set Id
    let newId
    if (lastId == null) {
      newId = `${date}e0001`
    } else {
      const lastIdArray = lastId.split('e')
      const lastIdDate = lastIdArray[0]
      const lastIdNumber = lastIdArray[1]

      if (lastIdDate !== date) {
        newId = `${date}e0001`
      } else {
        newId = `${date}e`

        const newIdNumber = Number(lastIdNumber) + 1
        const zeroCount = 4 - newIdNumber.toString().length
        for (let i = 0; i < zeroCount; i++) {
          newId += '0'
        }
        newId += newIdNumber.toString()
      }
    }

    //Post Order Header
    const orderHeader: OrderHeader = {
      id: newId,
      table: table,
      status: 'Unread',
      totalPrice: getTotalPrice(),
    }

    await postOrderHeader(store, orderHeader)

    //Post Order Details
    const orderDetails: OrderDetail[] = []

    for (const item of cart) {
      const menuOrderDetail: OrderDetail = {
        id: newId,
        table: table,
        status: 'Unread',
        menu: `${item.menu.category}-${item.menu.id}.${item.menu.englishName}`,
        price: getItemPrice(item.menu.price, item.amount),
        amount: item.amount,
      }
      orderDetails.push(menuOrderDetail)

      for (const option of item.options) {
        if (option == null) {
          continue
        }

        const optionOrderDetail: OrderDetail = {
          id: newId,
          table: table,
          status: 'Unread',
          menu: `++ ${option.englishName}(${option.price})`,
          price: getItemPrice(option.price, item.amount),
          amount: item.amount,
        }
        orderDetails.push(optionOrderDetail)
      }
    }

    await postOrderDetails(store, orderDetails)

    //Placed!
    setOrderStatus('Placed')
    clear()
    setCurrentCategory(null)
  }

  return (
    <div className={cartStyles.cartContainer}>
      {orderStatus == null ? (
        // Before Ordering
        <>
          <h1>Cart</h1>

          {/* Items */}
          {cart.map((item, i) => (
            <div className={cartStyles.item}>
              {/* Menu Name */}
              <p className={cartStyles.menuName}>
                {item.menu.category}-{item.menu.id}.{item.menu.englishName}
              </p>

              {/* Options */}
              <div className={cartStyles.options}>
                {item.options.map((option) => (
                  <>
                    {option ? (
                      <p>
                        ++{option.englishName}(${option.price.toFixed(2)})
                      </p>
                    ) : null}
                  </>
                ))}
              </div>

              {/* Amount */}
              <div className={cartStyles.amount}>
                <p>
                  Unit Price: ${getUnitPrice(item).toFixed(2)}{' '}
                  <span>× {item.amount}</span>
                </p>
                <div>
                  <button
                    disabled={item.amount <= 1}
                    onClick={() => decreaseAmount(i)}
                  >
                    ▼
                  </button>
                  <button onClick={() => increaseAmount(i)}>▲</button>
                </div>
              </div>

              {/* Price & Delete */}
              <div className={cartStyles.priceAndDelete}>
                <p>
                  Price: $
                  {getItemPrice(getUnitPrice(item), item.amount).toFixed(2)}
                </p>
                <button onClick={() => handleDelete(i)}>Delete</button>
              </div>
            </div>
          ))}

          {cart.length > 0 ? (
            <>
              {/* Total Price */}
              <p className={cartStyles.totalPrice}>
                Total Price: ${getTotalPrice().toFixed(2)}
              </p>

              {/* Buttons */}
              <div className={cartStyles.buttons}>
                <Link href={`/${store}/${table}/menus`}>{'<<'}Go Back</Link>
                <button onClick={placeOrder}>Place Order</button>
              </div>
            </>
          ) : null}
        </>
      ) : (
        // After Ordering
        <>
          {/* Status */}
          {orderStatus === 'Pending' ? (
            <div className={cartStyles.pending}>
              <h1 style={{ color: 'blue' }}>Placing Order</h1>
              <Loading size="1.5rem" />
            </div>
          ) : null}
          {orderStatus === 'Placed' ? (
            <h1 style={{ color: 'green' }}>
              Your order has been successfully placed!
            </h1>
          ) : null}

          {/* Placed Order */}
          {placedOrder?.map((item) => (
            <div className={cartStyles.placedOrder}>
              {/* Menu Order */}
              <div className={cartStyles.menuOrder}>
                <p className={cartStyles.menuName}>
                  {item.menu.category}-{item.menu.id}.{item.menu.englishName}
                </p>
                <div className={cartStyles.amountAndPrice}>
                  <p>× {item.amount}</p>
                  <p>
                    ${getItemPrice(getUnitPrice(item), item.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Option Order */}
              <div className={cartStyles.optionOrder}>
                {item.options.map((option) => (
                  <>
                    {option ? (
                      <p>
                        ++{option.englishName}($
                        {option.price.toFixed(2)})
                      </p>
                    ) : null}
                  </>
                ))}
              </div>
            </div>
          ))}

          {/* Placed Order Price */}
          {placedOrderPrice ? (
            <div className={cartStyles.placedOrderPrice}>
              <p>Total Price: ${placedOrderPrice?.toFixed(2)}</p>
            </div>
          ) : null}

          {/* Back To Home */}
          {orderStatus === 'Placed' ? (
            <Link
              href={`/${store}/${table}/`}
              className={cartStyles.backToHome}
            >
              Back To Home
            </Link>
          ) : null}
        </>
      )}
    </div>
  )
}
