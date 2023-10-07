import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  DocumentData,
  where,
  limit,
  addDoc,
  writeBatch,
} from 'firebase/firestore'
import {
  Category,
  Menu,
  Table,
  Option,
  Options,
  OrderHeader,
  OrderDetail,
} from './types'

//Firebase Setup
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

//Categories Get All
export async function getAllCategories(store: string) {
  const categoriesRef = collection(db, `${store}Categories`)
  const categoriesQuery = query(categoriesRef, orderBy('id'))
  const snapshot = await getDocs(categoriesQuery)

  const categories: Category[] = []
  snapshot.forEach((document) => {
    categories.push(document.data() as Category)
  })

  return categories
}

//Company Name Get
export async function getCompanyName(store: string) {
  const companyNameRef = doc(db, `${store}Settings`, 'companyName')
  const snapshot = await getDoc(companyNameRef)
  const companyName = snapshot.data()?.name as string

  return companyName
}

//Tables Get All
export async function getAllTables(store: string) {
  const tablesRef = collection(db, `${store}Tables`)
  const snapshot = await getDocs(tablesRef)

  const tables: Table[] = []
  snapshot.forEach((table) => {
    tables.push(table.data() as Table)
  })

  return tables
}

//Menus Get All
export async function getAllMenus(store: string) {
  const menusRef = collection(db, `${store}Menus`)
  const snapshot = await getDocs(menusRef)

  const menus: Menu[] = []
  snapshot.forEach((table) => {
    menus.push(table.data() as Menu)
  })

  return menus
}

//Menu Get
export async function getMenu(store: string, category: string, id: string) {
  const menuRef = doc(db, `${store}Menus`, `${category}-${id}`)
  const snapshot = await getDoc(menuRef)
  const menu = snapshot.data() as Menu

  return menu
}

//Options Get
export async function getOptions(store: string, category: string, id: string) {
  const optionsRef = collection(db, `${store}Options`)
  const optionsQuery = query(
    optionsRef,
    where('menuCategory', '==', category),
    where('menuId', '==', id)
  )
  const snapshot = await getDocs(optionsQuery)

  const documents: DocumentData[] = []
  snapshot.forEach((document) => {
    documents.push(document.data())
  })

  const options: Options = {}
  for (const d of documents) {
    if (d.category in options) {
      options[d.category].push(d as Option)
    } else {
      options[d.category] = [d as Option]
    }
  }

  return options
}

//Last Order Id Get
export async function getLastOrderIdOrNull(store: string) {
  const orderHeadersRef = collection(db, `${store}OrderHeaders`)
  const orderHeadersQuery = query(
    orderHeadersRef,
    orderBy('id', 'desc'),
    limit(1)
  )
  const snapshot = await getDocs(orderHeadersQuery)

  const documents: DocumentData[] = []
  snapshot.forEach((document) => {
    documents.push(document.data())
  })

  if (documents.length < 1) {
    return null
  }

  return documents[0].id as string
}

//Order Header Get
export async function getOrderHeaders(store: string) {
  const orderHeadersRef = collection(db, `${store}OrderHeaders`)
  const orderHeadersQuery = query(
    orderHeadersRef,
    where('status', '==', 'Unread')
  )
  const snapshot = await getDocs(orderHeadersQuery)

  const orderHeaders: OrderHeader[] = []
  const refIds: string[] = []

  snapshot.forEach((orderHeader) => {
    orderHeaders.push(orderHeader.data() as OrderHeader)
    refIds.push(orderHeader.id)
  })

  return {
    orderHeaders: orderHeaders,
    refIds: refIds,
  }
}

//Order Header Put
export async function updateOrderHeaders(store: string, refIds: string[]) {
  const batch = writeBatch(db)

  for (const refId of refIds) {
    const orderHeaderRef = doc(db, `${store}OrderHeaders`, refId)
    batch.update(orderHeaderRef, {
      status: 'Read',
    })
  }

  await batch.commit()
}

//Order Header Post
export async function postOrderHeader(store: string, orderHeader: OrderHeader) {
  const orderHeadersRef = collection(db, `${store}OrderHeaders`)

  await addDoc(orderHeadersRef, orderHeader)
}

//Order Details Get
export async function getOrderDetails(store: string) {
  const orderDetailsRef = collection(db, `${store}OrderDetails`)
  const orderDetailsQuery = query(
    orderDetailsRef,
    where('status', '==', 'Unread')
  )
  const snapshot = await getDocs(orderDetailsQuery)

  const orderDetails: OrderDetail[] = []
  const refIds: string[] = []

  snapshot.forEach((orderDetail) => {
    orderDetails.push(orderDetail.data() as OrderDetail)
    refIds.push(orderDetail.id)
  })

  return {
    orderDetails: orderDetails,
    refIds: refIds,
  }
}

//Order Details Put
export async function updateOrderDetails(store: string, refIds: string[]) {
  const batch = writeBatch(db)

  for (const refId of refIds) {
    const orderDetailRef = doc(db, `${store}OrderDetails`, refId)
    batch.update(orderDetailRef, { status: 'Read' })
  }

  batch.commit()
}

//Order Details Post
export async function postOrderDetails(
  store: string,
  orderDetails: OrderDetail[]
) {
  const batch = writeBatch(db)

  for (const orderDetail of orderDetails) {
    const orderDetailRef = doc(collection(db, `${store}OrderDetails`))
    batch.set(orderDetailRef, orderDetail)
  }

  await batch.commit()
}
