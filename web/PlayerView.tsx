import { useContext } from 'solid-js'
import { PlayerDataContext } from './resources/getDataResource'
import PausedTurnView from './PausedTurnView'
import GuessingWordsTurnView from './GuessingWordsTurnView'
import TakingImagesTurnView from './TakingImagesTurnView'

export default function PlayerView() {
  const data = useContext(PlayerDataContext)
  const getView = () => {
    const turn = data.turnData.turn
    switch (turn) {
      case 'paused': {
        return <PausedTurnView />
      }
      case 'guessing_words': {
        return <GuessingWordsTurnView />
      }
      case 'taking_images': {
        return <TakingImagesTurnView />
      }
      default: {
        console.error(`Unknown turn ${turn satisfies never}`)
      }
    }
  }

  return <div>{getView()}</div>
}
