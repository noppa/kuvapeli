import { JSX } from 'solid-js'
import type { GuessResult, Word as WordType } from '../shared/dbTypes'

type Props = {
  word: Omit<WordType, 'chosenForPlayer' | 'group'>
  guessResults: GuessResult[]
  label?: JSX.Element
}

const images = {
  correct: [
    new URL('./assets/correct1.jpeg', import.meta.url),
    new URL('./assets/correct2.jpeg', import.meta.url),
    new URL('./assets/correct3.jpeg', import.meta.url),
    new URL('./assets/correct4.jpeg', import.meta.url),
  ],
  wrong: [
    new URL('./assets/wrong1.jpeg', import.meta.url),
    new URL('./assets/wrong2.jpeg', import.meta.url),
    new URL('./assets/wrong3.jpeg', import.meta.url),
  ],
  pending: [new URL('./assets/pending.jpeg', import.meta.url)],
}

export default function Word(props: Props) {
  const { word, guessResults } = props

  const isCorrect = (): null | boolean => {
    const guessResult = guessResults.find((g) => g.word === word.uuid)
    if (guessResult) {
      return guessResult.correct
    }
    return null
  }
  const getImage = () => {
    const correct = isCorrect()
    const imageSet =
      correct === null
        ? images.pending
        : correct
          ? images.correct
          : images.wrong
    // Select pseudorandom image
    const seed = word.uuid.charCodeAt(0) + word.uuid.charCodeAt(1)
    const index = seed % imageSet.length
    return imageSet[index].toString()
  }

  const getStateLabel = () => {
    const correct = isCorrect()
    if (correct === null) {
      return 'Pari ei vielä ole vastannut'
    }
    return correct ? 'Oikein arvattu' : 'Väärin arvattu'
  }

  const getFilter = () => {
    const correct = isCorrect()
    if (correct === null) {
      return 'grayscale(70%) opacity(90%)'
    }
    return correct ? 'opacity(90%)' : 'sepia(80%) opacity(90%)'
  }

  return (
    <div
      class="word"
      style={{
        'background-image': `url(${getImage()})`,
        filter: getFilter(),
      }}
    >
      <strong class="word-name">{word.name}</strong>
      {props.label ?? <i class="word-result">{getStateLabel()}</i>}
    </div>
  )
}
