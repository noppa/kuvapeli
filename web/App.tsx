import * as Solid from 'solid-js'
import getToken from './getToken'

const App: Solid.Component<{ children?: Solid.JSX.Element }> = (props) => {
  const token = getToken()
  if (!token) {
    return <div>Tarvitset kutsun pelataksesi.</div>
  }

  return (
    <div>
      <header>
        <h1>📷🕵️ Salatut kuvat -kisa</h1>
      </header>
      <main>{props.children}</main>
      <footer></footer>
    </div>
  )
}

export default App
