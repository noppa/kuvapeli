import express from 'express'

const app = express()
const port = process.env.PORT || 3000

const router = express.Router()

router.get('/data', (req, res) => {
  res.send('Hello World!')
})

app.use('/api', router)

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
