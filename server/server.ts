import express from 'express'
import getUser from './getUser'
import getAdminData from './getAdminData'
import {
  AdminData,
  CrudOperation,
  Game,
  Player,
  PlayerData,
  Word,
} from '../shared/db-types'
import getPlayerData from './getPlayerData'
import bodyParser from 'body-parser'
import getGameAsAdmin from './getGameAsAdmin'
import handleCrudOperations from './handleCrudOperations'

const app = express()
const port = process.env.PORT || 3000

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
    res.status(200)
  } catch (err) {
    res.status(500).send(String(err))
  }
})

router.post('/admin/words', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Word>[] = req.body.operations
    await handleCrudOperations('words', { game: game.uuid }, crudOperations)
    res.status(200)
  } catch (err) {
    res.status(500).send(String(err))
  }
})

router.post('/admin/players', async (req, res) => {
  try {
    const game = await getGameAsAdmin(req)
    const crudOperations: CrudOperation<Player>[] = req.body.operations
    await handleCrudOperations('players', { game: game.uuid }, crudOperations)
    res.status(200)
  } catch (err) {
    res.status(500).send(String(err))
  }
})

app.use('/api', bodyParser.json(), router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
