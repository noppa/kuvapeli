import { createContext, createResource } from 'solid-js'
import makeApiRequest from './makeApiRequest'
import { AdminData, PlayerData } from '../../shared/dbTypes'

export type DataFetchingResult =
  | { type: 'admin'; data: AdminData }
  | { type: 'player'; data: PlayerData }

function initDataResource() {
  let fetchedData: DataFetchingResult | undefined
  async function fetchData(): Promise<DataFetchingResult> {
    const result = await makeApiRequest('data')
    return result
  }
  const [data, { refetch }] = createResource(async () => {
    if (!fetchedData) {
      fetchedData = await fetchData()
    }
    return fetchedData
  })
  async function wrappedRefetch(): Promise<void> {
    const newFetchedData = await fetchData()
    if (JSON.stringify(fetchData) !== JSON.stringify(newFetchedData)) {
      console.log('Data updated', fetchData, newFetchedData)
      fetchedData = newFetchedData
      refetch()
    } else {
      console.log('Data not updated')
    }
  }
  return { data, refetch: wrappedRefetch }
}

let initialized: undefined | ReturnType<typeof initDataResource>

export default function getDataResource() {
  if (initialized) return initialized
  return (initialized = initDataResource())
}

export const PlayerDataContext = createContext<PlayerData>(
  null as any as PlayerData,
)
export const AdminDataContext = createContext<AdminData>(
  null as any as AdminData,
)
