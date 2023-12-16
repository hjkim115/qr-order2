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
  writeBatch,
} from 'firebase/firestore'
import {
  Category,
  Menu,
  Table,
  Option,
  Options,
  Settings,
  Order,
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
  const categoriesRef = collection(doc(db, 'categories', store), 'categories')
  const categoriesQuery = query(categoriesRef, orderBy('id'))
  const snapshot = await getDocs(categoriesQuery)

  const categories: Category[] = []
  snapshot.forEach((document) => {
    categories.push(document.data() as Category)
  })

  return categories
}

//Settings Get
export async function getSettings(store: string) {
  const settingsRef = doc(db, 'settings', store)
  const snapshot = await getDoc(settingsRef)
  const settings = snapshot.data() as Settings

  return settings
}

//Tables Get All
export async function getAllTables(store: string) {
  const tablesRef = collection(doc(db, 'tables', store), 'tables')
  const snapshot = await getDocs(tablesRef)

  const tables: Table[] = []
  snapshot.forEach((table) => {
    tables.push(table.data() as Table)
  })

  return tables
}

//Menus Get All
export async function getAllMenus(store: string) {
  const menusRef = collection(doc(db, 'menus', store), 'menus')
  const snapshot = await getDocs(menusRef)

  const menus: Menu[] = []
  snapshot.forEach((table) => {
    menus.push(table.data() as Menu)
  })

  return menus
}

//Menu Get
export async function getMenu(store: string, category: string, id: string) {
  const menusRef = collection(doc(db, 'menus', store), 'menus')
  const menusQuery = query(
    menusRef,
    where('category', '==', category),
    where('id', '==', id)
  )
  const snapshot = await getDocs(menusQuery)

  const menus: Menu[] = []
  snapshot.forEach((document) => {
    menus.push(document.data() as Menu)
  })

  return menus[0]
}

//Options Get
export async function getOptions(store: string, category: string, id: string) {
  const optionsRef = collection(doc(db, 'options', store), 'options')
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

//Order Details Post
export async function postOrders(store: string, orders: Order[]) {
  const batch = writeBatch(db)

  for (const order of orders) {
    const orderRef = doc(collection(db, `${store}Orders`))
    batch.set(orderRef, order)
  }

  await batch.commit()
}
