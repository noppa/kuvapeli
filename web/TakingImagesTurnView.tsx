import { JSX, Match, Show, createSignal, useContext } from 'solid-js'
import getDataResource, { PlayerDataContext } from './resources/getDataResource'
import { TakingImagesTurnData } from '../shared/dbTypes'
import getApiUrl from './resources/getApiUrl'
import makeApiRequest from './resources/makeApiRequest'
import getToken from './getToken'

type UploadState =
  | { type: 'error'; value: string }
  | { type: 'loading'; value?: undefined }
  | { type: 'success'; value?: undefined }

export default function TakingImagesTurnView() {
  const [imagePreviewUrl, setImagePreviewUrl] = createSignal('')
  const [uploadState, setUploadState] = createSignal<UploadState | null>(null)
  const data = useContext(PlayerDataContext)
  const turnData = data.turnData as TakingImagesTurnData
  if (turnData.turn !== 'taking_images') {
    console.warn('TakingImagesTurnView rendered but turn is not taking_images')
    return null
  }

  const canTakeMoreImages = () =>
    turnData.takenImages.length < turnData.wordsToTakeImagesFor.length

  const uploadImage: JSX.EventHandlerUnion<
    HTMLFormElement,
    Event & {
      submitter: HTMLElement
    }
  > = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const img = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = img.files?.[0]
    if (!file) {
      console.warn('Form was submitted but there is no file', form)
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    setUploadState({ type: 'loading' })
    try {
      await makeApiRequest('upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': undefined as any,
        },
      })
      setUploadState({ type: 'success' })
      setImagePreviewUrl('')
      try {
        getDataResource().refetch()
      } catch (err) {
        console.error(err)
        setUploadState({
          type: 'error',
          value: `Sivun päivityksessä tapahtui virhe. Päivitä sivu. ${err}`,
        })
      }
    } catch (err) {
      console.error(err)
      setUploadState({ type: 'error', value: String(err) })
    }
  }

  const onImageSelected: JSX.ChangeEventHandlerUnion<
    HTMLInputElement,
    Event
  > = (event) => {
    event.preventDefault()
    const files = event.target.files
    if (!files?.length) {
      setImagePreviewUrl('')
      return
    }
    setImagePreviewUrl(URL.createObjectURL(files[0]))
  }

  const authToken = getToken()

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
      <section>
        <details>
          <summary>Näytä kierroksen kaikki sanavaihtoehdot</summary>
          <ul>
            {data.wordOptions.map((word) => {
              return <li>{word.name}</li>
            })}
          </ul>
        </details>
      </section>
      <section>
        <Show
          when={canTakeMoreImages()}
          fallback={<div>Olet ottanut jo tarpeeksi kuvia</div>}
        >
          <form
            method="post"
            enctype="multipart/form-data"
            onSubmit={uploadImage}
          >
            <label for="image-upload">Lataa kuva</label>
            <input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={onImageSelected}
            />
            <Show when={imagePreviewUrl()}>
              <figure>
                <figcaption>Esikatselu</figcaption>
                <img
                  alt="Esikatselu"
                  class="image-preview"
                  src={imagePreviewUrl()}
                />
              </figure>
            </Show>

            <button
              type="submit"
              disabled={
                !imagePreviewUrl() ||
                ['loading', 'error'].includes(uploadState()?.type as any)
              }
            >
              Lähetä kuva
            </button>
          </form>
        </Show>
        <Show when={Boolean(uploadState())}>
          <div>
            <Match when={uploadState()?.type === 'error'}>
              <pre class="danger">Virhe: {String(uploadState()?.value)}</pre>
            </Match>
            <Match when={uploadState()?.type === 'loading'}>
              <div aria-busy="true">Lähetetään kuvaa...</div>
            </Match>
            <Match when={uploadState()?.type === 'success'}>
              <div aria-busy="true">Kuva lähetetty</div>
            </Match>
          </div>
        </Show>
      </section>
      <section>
        <h4>Kuvasi</h4>
        <div>
          {turnData.takenImages.map((image) => {
            const imageUrl = getApiUrl('images/' + image.uuid)
            const authQueryParam = '?authorization=' + authToken
            return (
              <div>
                <picture>
                  <source
                    srcset={imageUrl + '_optimized.webp' + authQueryParam}
                    type="image/webp"
                  />
                  <img src={imageUrl + authQueryParam} />
                </picture>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
