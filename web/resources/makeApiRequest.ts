export default async function makeApiRequest(
  api: string,
  options: RequestInit,
) {
  const response = await fetch([import.meta.env], options)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }
  return response.json()
}
