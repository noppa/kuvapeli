import express from 'express'
import getUser from './getUser'
import type { Request } from 'express'
import getAdminData from './getAdminData'
import { AdminData, PlayerData } from '../shared/db-types'
import getPlayerData from './getPlayerData'

const app = express()
const port = process.env.PORT || 3000

const router = express.Router()

router.get('/data', async (req: Request, res) => {
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
    res.status(500).send(String(err))
  }
})

app.use('/api', router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
