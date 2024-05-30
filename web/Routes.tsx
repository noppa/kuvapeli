import { Router, Route } from '@solidjs/router'
import App from './App'
import Home from './Home'
import AdminView from './AdminView'

export default function Routes() {
  return (
    <Router root={App}>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminView} />
    </Router>
  )
}
