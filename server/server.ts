import express from 'express'
import db from './db'

const app = express()
const port = process.env.PORT || 3000

const router = express.Router()

router.get('/data', async (req, res) => {
  try {
    const data = await db.select('*').from('users')
    console.log(data)
    res.json(data)
  } catch (err) {
    res.status(500).send(String(err))
  }
})

app.use('/api', router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
