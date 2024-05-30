import getToken from "../getToken"

export default async function makeApiRequest(
  api: string,
  options?: RequestInit,
) {
  // @ts-ignore
  const url = `${import.meta.env.VITE_API_URL}/api/${api}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getToken(),
      ...options.headers,
    }
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API request failed: ${response.statusText}: ${text}`)
  }
  return response.json()
}
