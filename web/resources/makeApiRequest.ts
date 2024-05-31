import getToken from '../getToken'
import getApiUrl from './getApiUrl'

export default async function makeApiRequest(
  api: string,
  options?: RequestInit,
) {
  const url = getApiUrl(api)
  let headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...options?.headers,
  }
  headers = JSON.parse(JSON.stringify(headers))

  const response = await fetch(url, {
    ...options,
    headers,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API request failed: ${response.statusText}: ${text}`)
  }
  return response.json()
}
