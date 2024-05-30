import { createSignal, useContext } from 'solid-js'
import { AdminDataContext } from './resources/getDataResource'
import { AdminData, CrudOperation, Game } from '../shared/dbTypes'
import makeApiRequest from './resources/makeApiRequest'

export default function AdminView() {
  const data = useContext(AdminDataContext)
  const [error, setError] = createSignal('')
	const [savedTimestamp, setSavedTimestamp] = createSignal('')

  const submit = async (event) => {
    try {
      event.preventDefault()
      const form = event.target as HTMLFormElement
      const pre = form.querySelector('pre') as HTMLPreElement
      const newData = JSON.parse(pre.textContent) as AdminData

			await Promise.all([
				makeApiRequest('admin/games', {
					method: 'PUT',
					body: JSON.stringify([{op: 'U', data: newData.game}] satisfies CrudOperation<Game>[]),
				}),
			])

			setError('')
			setSavedTimestamp(new Date().toISOString())
    } catch (err) {
      console.error(err)
      setError(String(err))
    }
  }

  return (
    <div>
      <h2>Admin</h2>

      <form onSubmit={submit}>
        <section>
          <label>
            Peliasetukset
            <pre contentEditable={true}>{JSON.stringify(data, null, 2)}</pre>
          </label>
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
