import express from 'express'
import { classify } from './controllers/classifyController'
import { count } from './controllers/countController'
import { upload } from './controllers/uploadController'

const app = express()
const port = 3000

app.use(express.json())

app.get('/classify', classify)
app.get('/count', count)
app.post('/upload', upload)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
