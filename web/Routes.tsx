import { Router, Route } from '@solidjs/router'
import App from './App'
import AdminView from './AdminView'
import PlayerView from './PlayerView'

export default function Routes() {
  return (
    <Router root={App}>
      <Route path="/" component={PlayerView} />
      <Route path="/admin" component={AdminView} />
    </Router>
  )
}
