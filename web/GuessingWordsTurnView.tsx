import { Match, Show, createSignal, useContext } from 'solid-js'
import getDataResource, { PlayerDataContext } from './resources/getDataResource'
import { GuessingWordsTurnData, type Word as WordType } from '../shared/dbTypes'
import ImageGrid from './ImageGrid'
import Word from './Word'
import makeApiRequest from './resources/makeApiRequest'

type GuessState =
  | { type: 'error'; value: string }
  | { type: 'loading'; value?: undefined }
  | { type: 'success'; value?: undefined }

export default function GuessingWordsTurnView() {
  const [guessState, setGuessState] = createSignal<GuessState | null>(null)
  const data = useContext(PlayerDataContext)
  const turnData = data.turnData as GuessingWordsTurnData
  const getWordOptions = () => {
    const guessedWords = new Set(turnData.ownGuessedWords.map((g) => g.word))
    return data.wordOptions
      .filter((w) => !guessedWords.has(w.uuid))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  const allGuessed = () =>
    turnData.imagesToGuess.length <= turnData.ownGuessedWords.length

  const guessWord = async (
    word: Omit<WordType, 'chosenForPlayer' | 'group'>,
  ) => {
    const confirmation = confirm(
      `Oletko varma, että haluat arvata sanan "${word.name}"?`,
    )
    if (!confirmation) {
      return
    }

    try {
      setGuessState({ type: 'loading' })
      await makeApiRequest('guess', {
        method: 'POST',
        body: JSON.stringify({ word: word.uuid }),
      })
      setGuessState({ type: 'success' })
      await getDataResource().refetch()
    } catch (err) {
      console.error(err)
      setGuessState({ type: 'error', value: `Virhe arvauksessa: ${err}` })
    }
  }

  return (
    <div>
      <h3>🕵️ On vuorosi arvata sanoja</h3>

      <section>
        <h4>Parisi ottamat kuvat ({turnData.imagesToGuess.length} / 6)</h4>
        <ImageGrid images={turnData.imagesToGuess} />
      </section>
      <section>
        <h4>Arvaamasi sanat</h4>
        <div class="grid word-grid">
          {turnData.ownGuessedWords.map((guess) => {
            const word = data.wordOptions.find((w) => w.uuid === guess.word)
            if (!word) {
              console.error('Cannot find word', guess, data)
              return null
            }
            return <Word word={word} guessResults={turnData.ownGuessedWords} />
          })}
        </div>
      </section>
      <section>
        <h4>Sanavaihtoehdot</h4>
        <Show when={allGuessed()}>
          <p>Olet arvannut kaikki sanat</p>
        </Show>
        <Show when={Boolean(guessState())}>
          <div>
            <Match when={guessState()?.type === 'error'}>
              <pre class="danger">Virhe: {String(guessState()?.value)}</pre>
            </Match>
            <Match when={guessState()?.type === 'loading'}>
              <div aria-busy="true">Lähetetään arvausta...</div>
            </Match>
            <Match when={guessState()?.type === 'success'}>
              <div aria-busy="true">Arvaus lähetetty</div>
            </Match>
          </div>
        </Show>
        <div class="grid word-grid">
          {getWordOptions().map((word) => {
            return (
              <Word
                word={word}
                guessResults={[]}
                label={
                  <div>
                    <input
                      type="button"
                      value="Arvaa sana"
                      disabled={allGuessed()}
                      onClick={() => guessWord(word)}
                    />
                  </div>
                }
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
