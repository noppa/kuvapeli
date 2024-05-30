import * as Solid from 'solid-js'
import getDataResource, {
  AdminDataContext,
  PlayerDataContext,
} from './resources/getDataResource'
import { AdminData, PlayerData } from '../shared/dbTypes'

const App: Solid.Component<{ children?: Solid.JSX.Element }> = (props) => {
  const { data } = getDataResource()

  return (
    <Solid.Switch>
      <Solid.Match when={data.error}>{String(data.error)}</Solid.Match>
      <Solid.Match when={data.loading}>Ladataan...</Solid.Match>
      <Solid.Match when={!data.loading}>
        <div>
          <header>
            <h1>📷🕵️ Vakoojien lomakuvapeli</h1>
          </header>
          <main>
            {data().type === 'admin' ? (
              <AdminDataContext.Provider value={data().data as AdminData}>
                {props.children}
              </AdminDataContext.Provider>
            ) : (
              <PlayerDataContext.Provider value={data().data as PlayerData}>
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
