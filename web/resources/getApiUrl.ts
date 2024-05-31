export default function getApiUrl(api: string): string {
  // @ts-ignore
  return `${import.meta.env.VITE_API_URL}/api/${api}`
}
