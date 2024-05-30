import { createSignal, useContext } from 'solid-js'
import { AdminDataContext } from './resources/getDataResource'
import { AdminData, CrudOperation, Game, Player } from '../shared/dbTypes'
import makeApiRequest from './resources/makeApiRequest'
import { Uuid } from '../shared/utils'

export default function AdminView() {
  const data = useContext(AdminDataContext)
  const [error, setError] = createSignal('')
  const [savedTimestamp, setSavedTimestamp] = createSignal('')
  const playersToSave = new Set()

  let formRef!: HTMLFormElement

  const submit = async (event: any) => {
    try {
      event.preventDefault()
      const form = event.target as HTMLFormElement
      const pre = form.querySelector('pre') as HTMLPreElement
      const newData = JSON.parse(pre.textContent || '{}') as AdminData
      console.log('woop', newData)
      const playerPayload = newData.players.map((p): CrudOperation<Player> => {
        if (playersToSave.has(p.uuid)) {
          playersToSave.delete(p.uuid)
          return { op: 'C', data: p }
        }
        return { op: 'U', data: p }
      })

      await Promise.all([
        makeApiRequest('admin/games', {
          method: 'POST',
          body: JSON.stringify([
            { op: 'U', data: newData.game },
          ] satisfies CrudOperation<Game>[]),
        }),
        makeApiRequest('admin/players', {
          method: 'POST',
          body: JSON.stringify(playerPayload),
        }),
      ])
      playersToSave.clear()
      setError('')
      setSavedTimestamp(new Date().toISOString())
    } catch (err) {
      console.error(err)
      setError(String(err))
    }
  }

  const addPlayer = (event: any) => {
    event.preventDefault()
    const form = formRef
    const pre = form.querySelector('pre') as HTMLPreElement
    const data = JSON.parse(pre.textContent || '{}') as AdminData
    const groupAPlayers = data.players.filter((p: any) => p.group === 1)
    const groupBPlayers = data.players.filter((p: any) => p.group === 2)
    const group = groupAPlayers.length <= groupBPlayers.length ? 1 : 2
    const otherGroup = group === 1 ? groupBPlayers : groupAPlayers
    const friend = otherGroup.find((g) => !g.pairedWithPlayer)
    const uuid = crypto.randomUUID() as Uuid
    let pairedWithPlayer = ''
    if (friend) {
      friend.pairedWithPlayer = uuid
      pairedWithPlayer = friend.uuid
    }

    playersToSave.add(uuid)
    data.players.push({
      uuid,
      game: data.game.uuid,
      name: '',
      token: crypto.randomUUID().substring(0, 15).replace(/-/g, ''),
      group,
      pairedWithPlayer: pairedWithPlayer as Uuid,
    })

    pre.innerText = JSON.stringify(data, null, 2)
  }

  return (
    <div>
      <h2>Admin</h2>

      <h3>Peliasetukset</h3>
      <form ref={formRef} onSubmit={submit}>
        <section>
          <div>
            <button type="button" onClick={addPlayer}>
              Lisää pelaaja
            </button>
          </div>
          <pre contentEditable={true}>{JSON.stringify(data, null, 2)}</pre>
        </section>
        <section>
          <button>Tallenna</button>

          {error() && <p class="danger">{error()}</p>}
          {savedTimestamp() && <p>Tallennettu {savedTimestamp()}</p>}
        </section>
      </form>
    </div>
  )
}
