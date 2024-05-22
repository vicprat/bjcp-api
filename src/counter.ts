import fs from 'fs'
import path from 'path'

const categoriesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'beerCategories.json'), 'utf-8')
)

const beerStylesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'beerStyles.json'), 'utf-8')
)

const categories = categoriesData.length
console.log('beer_categories', categories)

const styles = beerStylesData.length
console.log('beer_styles', styles)
