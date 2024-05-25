import express from 'express'
import { classify } from './controllers/classifyController'
import { count } from './controllers/countController'
import { upload } from './controllers/uploadController'
import { scrapeBeerStyles } from './controllers/beerStylesController'
import { scrapeBeerCategories } from './controllers/beerCategoriesController'
import { scrapeYeastData } from './controllers/lallemandYeastController'

const app = express()
const port = 8080

app.use(express.json())

app.get('/classify', classify)
app.get('/count', count)
app.get('/scraper/beer-styles', scrapeBeerStyles)
app.get('/scraper/beer-categories', scrapeBeerCategories)
app.get('/scraper/lallemand-yeast', scrapeYeastData)

app.post('/upload', upload)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
