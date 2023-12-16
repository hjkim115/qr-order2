import { UUID } from 'crypto'

export type Category = {
  id: string
  englishName: string
  koreanName: string
}

export type Menu = {
  id: number
  category: string
  koreanName: string
  englishName: string
  price: number
  description: string
  imageName: string
}

export type Table = {
  id: string
  tableNumber: string
}

export type Option = {
  id: string
  category: string
  menuId: string
  menuCategory: string
  englishName: string
  koreanName: string
  price: number
}

export type Options = {
  [key: string]: Option[]
}

export type Item = {
  menu: Menu
  amount: number
  options: (Option | null)[]
}

export type Order = {
  id: string
  seq: number
  table: string
  status: 'Unread' | 'Read'
  menu: string
  price: number
  amount: number
  date: string
  time: string
}

export type Settings = {
  name: string
  logoImageName: string
}
