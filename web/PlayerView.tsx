import { createResource, useContext } from 'solid-js'
import { PlayerDataContext } from './resources/getDataResource'
import { useNavigate } from '@solidjs/router'

export default function PlayerView() {
  const data = useContext(PlayerDataContext)
  const navigate = useNavigate()
  createResource(() => {
    const turn = data.turnData.turn
    switch (turn) {
      case 'paused': {
        navigate('/paused')
        break
      }
      case 'guessing_words': {
        navigate('/guessing_words')
        break
      }
      case 'taking_images': {
        navigate('/taking_images')
        break
      }
      default: {
        console.error(`Unknown turn ${turn satisfies never}`)
      }
    }
  })

  return <div></div>
}
