import express from 'express'
import { classify } from './controllers/classifyController'
import { count } from './controllers/countController'
import { upload } from './controllers/uploadController'
import { scrapeBeerStyles } from './controllers/beerStylesController'
import { scrapeBeerCategories } from './controllers/beerCategoriesController'

const app = express()
const port = 8080

app.use(express.json())

app.get('/classify', classify)
app.get('/count', count)
app.get('/scrape/beer-styles', scrapeBeerStyles)
app.get('/scrape/beer-categories', scrapeBeerCategories)
app.post('/upload', upload)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
