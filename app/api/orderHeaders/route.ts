import { getOrderHeaders, updateOrderHeaders } from '@/app/utils/firebase'

export async function GET(request: any) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store')
  const apiKey = searchParams.get('apiKey')

  if (typeof store !== 'string') {
    return Response.json({ message: 'Store is not set!' })
  }

  if (process.env.API_KEY !== apiKey) {
    return Response.json({ message: 'Access Denied!' })
  }

  try {
    const data = await getOrderHeaders(store)
    return Response.json(data)
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ message: error.message })
    }
  }
}

export async function PUT(request: any) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store')
  const apiKey = searchParams.get('apiKey')

  const body = await request.json()
  const refIds = body.refIds

  if (typeof store !== 'string') {
    return Response.json({ message: 'Store is not set!' })
  }

  if (process.env.API_KEY !== apiKey) {
    return Response.json({ message: 'Access Denied!' })
  }

  try {
    await updateOrderHeaders(store, refIds)
    return Response.json({ message: 'Order headers successfully updated!' })
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ message: error.message })
    }
  }
}

export async function OPTIONS() {
  return Response.json({ status: 200 })
}
