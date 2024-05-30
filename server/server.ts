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
} from '../shared/dbTypes'
import getPlayerData from './getPlayerData'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import getGameAsAdmin from './getGameAsAdmin'
import handleCrudOperations from './handleCrudOperations'
import * as path from 'path'
import multer from 'multer'
import db from './db'
import { Uuid, omit } from '../shared/utils'
import { exec } from 'child_process'
import getPlayer from './getPlayer'
import { PostGuessPayload } from '../shared/apiTypes'
import handleError from './handleError'
import {
  ERROR_CODE_FORBIDDEN,
  ERROR_CODE_UNPROCESSABLE_ENTITY,
} from './errorCodes'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3000
const fileUploadDir =
  process.env.FILE_UPLOAD_DIR || path.join(__dirname, '..', 'uploads')
// const webDistDir =
//   process.env.WEB_DIST_DIR || path.join(__dirname, '..', 'dist')

app
  .use(cookieParser())
  .use(bodyParser.json())

  .use(
    cors({
      origin: [/^http:\/\/localhost:[0-9]+/, /^[a-zA-Z0-9]+\.arpakuut.\.io/],
    }),
  )

  .use(function logRequest(req, res, next) {
    console.log({
      url: req.url,
      method: req.method,
      query: req.query,
      headers: req.headers,
      body: req.body && String(req.body).slice(0, 1000),
    })
    next()
  })

const router = express.Router()

router.get('/data', async function getData(req, res) {
  try {
    const user = await getUser(req)

    const cookieExpires = new Date()
    // Valid for 30 days
    cookieExpires.setDate(cookieExpires.getDate() + 30)
    const token =
      user.type === 'admin' ? user.value.adminToken : user.value.token

    res.header(
      'Set-Cookie',
      [
        `authorization=${token}`,
        `Path=/`,
        `HttpOnly`,
        `Secure`,
        `SameSite=none`,
        `Expires=${cookieExpires.toUTCString()}`,
      ].join('; '),
    )

    if (user.type === 'admin') {
      const adminData = await getAdminData(user.value)
      res.json({ type: 'admin', data: adminData satisfies AdminData })
    } else {
      const playerData = await getPlayerData(user.value)
      res.json({ type: 'player', data: playerData satisfies PlayerData })
    }
  } catch (err) {
    handleError(err, res)
  }
})

const upload = multer({ dest: fileUploadDir })

router.post('/guess', async function postGuess(req, res) {
  try {
    const player = await getPlayer(req)
    const playerData = await getPlayerData(player)
    const body = req.body as PostGuessPayload
    const { turnData } = playerData
    if (turnData.turn !== 'guessing_words') {
      throw new Error(`User ${player.name} is not guessing currently`)
    }
    const takenGuesses = turnData.ownGuessedWords.length
    const supposedToTakeGuesses = turnData.imagesToGuess.length
    if (takenGuesses >= supposedToTakeGuesses) {
      throw new Error(
        `${ERROR_CODE_FORBIDDEN} User ${player.name} has already guessed ${takenGuesses} words`,
      )
    }

    const wordUuid = body.word
    const wordIsInOptions = playerData.wordOptions.some(
      (opt) => opt.uuid === wordUuid,
    )
    if (!wordIsInOptions) {
      throw new Error(
        `${ERROR_CODE_UNPROCESSABLE_ENTITY} Word ${wordUuid} is not in the options`,
      )
    }

    await db('guesses').insert({
      uuid: body.uuid || crypto.randomUUID(),
      word: wordUuid,
      guessedByPlayer: player.uuid,
    })

    res.status(201).send({})
  } catch (err) {
    handleError(err, res)
  }
})

router.get(
  '/images/:filename',
  upload.single('image'),
  async function uploadImage(req, res) {
    try {
      await getUser(req)
      // Sanity check: must not contain / after the first .
      // to prevent path traversal.
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
      const player = await getPlayer(req)
      const userData = await getPlayerData(player)
      const { turnData } = userData
      if (turnData.turn !== 'taking_images') {
        throw new Error(`User ${player.name} is not taking pictures currently`)
      }
      const supposedToTakeImages = turnData.wordsToTakeImagesFor.length
      const takenImages = turnData.takenImages.length
      if (supposedToTakeImages <= takenImages) {
        throw new Error(
          `${ERROR_CODE_FORBIDDEN} User ${player.name} has already taken ${takenImages} images`,
        )
      }

      await db('images').insert({
        uuid: req.file!.filename satisfies string as Uuid,
        deletedAt: null,
        metadata: JSON.stringify(omit(req.file as any, ['buffer'] as const)),
        takenByPlayer: player.uuid,
      } satisfies Omit<Image, AutoGeneratedColumn>)

      // Optimize image
      try {
        exec(
          `convert ${JSON.stringify(req.file!.path)} -quality 85 -resize 1000x\\> ${JSON.stringify(req.file!.path + '_optimized_.webp')}`,
        )
      } catch (err) {
        console.error(err)
        console.info(
          `Image optimization failed for image ${req.file!.filename} of user ${player.name}`,
        )
      }

      res.status(201).send({})
    } catch (err) {
      console.error(err)
      res.status(500).send(String(err))
    }
  },
)

router.post('/admin/games', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Game>[] = req.body
    console.log('crudOperations', req.body)
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
    res.status(201).send({})
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

router.post('/admin/words', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Word>[] = req.body
    await handleCrudOperations('words', { game: game.uuid }, crudOperations)
    res.status(201).send({})
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

router.post('/admin/players', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Player>[] = req.body
    await handleCrudOperations<Player>(
      'players',
      { game: game.uuid },
      crudOperations,
    )
    res.status(201).send({})
  } catch (err) {
    console.error(err)
    res.status(500).send(String(err))
  }
})

app.use('/api', router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
