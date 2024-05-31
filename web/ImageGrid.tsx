import type { Image } from '../shared/dbTypes'
import getToken from './getToken'
import getApiUrl from './resources/getApiUrl'
type Props = {
  images: Omit<Image, 'metadata'>[]
}
export default function ImageGrid(props: Props) {
  const authToken = getToken()
  return (
    <div class="grid image-grid">
      {props.images.map((image) => {
        const imageUrl = getApiUrl('images/' + image.uuid)
        const authQueryParam = '?authorization=' + authToken
        return (
          <picture class="image-list-image">
            <source
              srcset={imageUrl + '_optimized.webp' + authQueryParam}
              type="image/webp"
            />
            <img src={imageUrl + authQueryParam} />
          </picture>
        )
      })}
    </div>
  )
}
