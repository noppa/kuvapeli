import { useContext } from 'solid-js'
import { PlayerDataContext } from './resources/getDataResource'
import { TakingImagesTurnData } from '../shared/dbTypes'

export default function TakingImagesTurnView() {
  const data = useContext(PlayerDataContext)
  const turnData = data.turnData as TakingImagesTurnData
  return (
    <div>
      <h3>📷 On vuorosi ottaa kuvia</h3>

      <section>
        <h4>Sanat</h4>
        <ul>
          {turnData.wordsToTakeImagesFor.map((word) => {
            return <li>{word.name}</li>
          })}
        </ul>
      </section>
    </div>
  )
}
