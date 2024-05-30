import { Router, Route } from '@solidjs/router'
import App from './App'
import AdminView from './AdminView'
import PlayerView from './PlayerView'
import PausedTurnView from './PausedTurnView'
import GuessingWordsTurnView from './GuessingWordsTurnView'
import TakingImagesTurnView from './TakingImagesTurnView'

export default function Routes() {
  return (
    <Router root={App}>
      <Route path="/" component={PlayerView} />
      <Route path="/admin" component={AdminView} />
      <Route path="/paused" component={PausedTurnView} />
      <Route path="/guessing_words" component={GuessingWordsTurnView} />
      <Route path="/taking_images" component={TakingImagesTurnView} />
    </Router>
  )
}
