import * as Solid from 'solid-js'
import getDataResource, {
  AdminDataContext,
  PlayerDataContext,
} from './resources/getDataResource'
import { AdminData, PlayerData } from '../shared/dbTypes'

const App: Solid.Component<{ children?: Solid.JSX.Element }> = (props) => {
  const { data } = getDataResource()
  const getTitle = () => {
    const obj = data()!
    if (obj.type !== 'player') {
      return null
    }
    const { pairedWithPlayer } = obj.data.player
    const pairedWith = obj.data.otherPlayers.find(
      (p) => p.uuid === pairedWithPlayer,
    )

    return `${obj.data.player.name} & ${pairedWith?.name}`
  }

  return (
    <Solid.Switch>
      <Solid.Match when={data.error}>{String(data.error)}</Solid.Match>
      <Solid.Match when={data.loading}>
        <div aria-busy="true">Ladataan...</div>
      </Solid.Match>
      <Solid.Match when={!data.loading}>
        <div>
          <header>
            <h1>📷🕵️ Vakoojien lomakuvapeli</h1>
            <h2>{getTitle()}</h2>
          </header>
          <main>
            {data()?.type === 'admin' ? (
              <AdminDataContext.Provider value={data()!.data as AdminData}>
                {props.children}
              </AdminDataContext.Provider>
            ) : (
              <PlayerDataContext.Provider value={data()!.data as PlayerData}>
                {props.children}
              </PlayerDataContext.Provider>
            )}
          </main>
          <footer></footer>
        </div>
      </Solid.Match>
    </Solid.Switch>
  )
}

export default App
