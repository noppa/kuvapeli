import express from 'express'
import getUser from './getUser'
import getAdminData from './getAdminData'
import type {
  AdminData,
  CrudOperation,
  Game,
  Player,
  PlayerData,
  Word,
  Image,
  AutoGeneratedColumn,
} from '../shared/db-types'
import getPlayerData from './getPlayerData'
import bodyParser from 'body-parser'
import getGameAsAdmin from './getGameAsAdmin'
import handleCrudOperations from './handleCrudOperations'
import * as path from 'path'
import multer from 'multer'
import db from './db'
import { Uuid, omit } from '../shared/utils'
import { exec } from 'child_process'

const app = express()
const port = process.env.PORT || 3000
const fileUploadDir =
  process.env.FILE_UPLOAD_DIR || path.join(__dirname, '..', 'uploads')
// const webDistDir =
//   process.env.WEB_DIST_DIR || path.join(__dirname, '..', 'dist')

const router = express.Router()

router.get('/data', async (req, res) => {
  try {
    const user = await getUser(req)

    if (user.type === 'admin') {
      const adminData = await getAdminData(user.value)
      res.json({ type: 'admin', data: adminData satisfies AdminData })
    } else {
      const playerData = await getPlayerData(user.value)
      res.json({ type: 'player', data: playerData satisfies PlayerData })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

const upload = multer({ dest: fileUploadDir })

router.get(
  '/images/:filename',
  upload.single('image'),
  async function uploadImage(req, res) {
    try {
      await getUser(req)
      // Sanity check: must not contain / after the first .
      const partAfterFirstDot = req.params.filename
        .split('.')
        .slice(1)
        .join('.')
      if (partAfterFirstDot.includes('/') || partAfterFirstDot.includes('\\')) {
        throw new Error(`Invalid filename ${req.params.filename}`)
      }

      res.sendFile(path.join(fileUploadDir, req.params.filename))
    } catch (err) {
      console.error(err)
      res.status(500).send(String(err))
    }
  },
)

router.post(
  '/upload',
  upload.single('image'),
  async function uploadImage(req, res) {
    try {
      const user = await getUser(req)
      if (user.type !== 'player') {
        throw new Error(`User is not a player`)
      }
      const userData = await getPlayerData(user.value)
      const { turnData } = userData
      if (turnData.turn !== 'taking_images') {
        throw new Error(`User ${user.value.name} taking pictures currently`)
      }
      const supposedToTakeImages = turnData.wordsToTakeImagesFor.length
      const takenImages = turnData.takenImages.length
      if (supposedToTakeImages <= takenImages) {
        throw new Error(
          `User ${user.value.name} has already taken ${takenImages} images`,
        )
      }

      await db('images').insert({
        uuid: req.file.filename satisfies string as Uuid,
        deletedAt: null,
        metadata: JSON.stringify(omit(req.file, ['buffer'] as const)),
        takenByPlayer: user.value.uuid,
      } satisfies Omit<Image, AutoGeneratedColumn>)

      // Optimize image
      try {
        exec(
          `convert ${JSON.stringify(req.file.path)} -quality 85 -resize 1000x\\> ${JSON.stringify(req.file.path + '_optimized_.webp')}`,
        )
      } catch (err) {
        console.error(err)
        console.info(
          `Image optimization failed for image ${req.file.filename} of user ${user.value.name}`,
        )
      }

      res.sendStatus(201)
    } catch (err) {
      console.error(err)
      res.status(500).send(String(err))
    }
  },
)

router.put('/admin/games', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Game>[] = req.body.operations
    await handleCrudOperations(
      'games',
      { uuid: game.uuid },
      crudOperations.filter((change) => change.op !== 'C'),
    )
    await handleCrudOperations(
      'games',
      {},
      crudOperations.filter((change) => change.op === 'C'),
    )
    res.sendStatus(201)
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

router.post('/admin/words', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Word>[] = req.body.operations
    await handleCrudOperations('words', { game: game.uuid }, crudOperations)
    res.sendStatus(201)
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

router.post('/admin/players', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Player>[] = req.body.operations
    await handleCrudOperations('players', { game: game.uuid }, crudOperations)
    res.sendStatus(201)
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

app.use('/api', bodyParser.json(), router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
