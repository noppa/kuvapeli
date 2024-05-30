export default async function makeApiRequest(
  api: string,
  options?: RequestInit,
) {
  const url = `${import.meta.env.VITE_API_URL}/api/${api}`
  const response = await fetch(url, options)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API request failed: ${response.statusText}: ${text}`)
  }
  return response.json()
}
