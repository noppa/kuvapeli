import * as Solid from 'solid-js'
import getDataResource from './resources/getDataResource'

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
            <div>{JSON.stringify(data, null, 2)}</div>
            {props.children}
          </main>
          <footer></footer>
        </div>
      </Solid.Match>
    </Solid.Switch>
  )
}

export default App
