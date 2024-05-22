import fs from 'fs'
import path from 'path'

const rawData = fs.readFileSync(
  path.join(__dirname, '..', 'bjcp_styleguide-2021.json'),
  'utf-8'
)
const data = JSON.parse(rawData)

const beers = data.beerjson.styles

const categories: {
  category: string
  category_id: string
  category_description: string
}[] = []
const beerStyles: any[] = []

const categoryMap = new Map()

beers.forEach((beer: any) => {
  if (!categoryMap.has(beer.category_id)) {
    categoryMap.set(beer.category_id, true)
    categories.push({
      category: beer.category,
      category_id: beer.category_id,
      category_description: beer.category_description,
    })
  }

  beerStyles.push({
    name: beer.name,
    category_id: beer.category_id,
    style_id: beer.style_id,
    overall_impression: beer.overall_impression,
    aroma: beer.aroma,
    appearance: beer.appearance,
    flavor: beer.flavor || null,
    mouthfeel: beer.mouthfeel,
    comments: beer.comments,
    history: beer.history,
    style_comparison: beer.style_comparison,
    tags: beer.tags,
    original_gravity_min: beer.original_gravity?.minimum?.value || null,
    original_gravity_max: beer.original_gravity?.maximum?.value || null,
    international_bitterness_units_min:
      beer.international_bitterness_units?.minimum?.value || null,
    international_bitterness_units_max:
      beer.international_bitterness_units?.maximum?.value || null,
    final_gravity_min: beer.final_gravity?.minimum?.value || null,
    final_gravity_max: beer.final_gravity?.maximum?.value || null,
    alcohol_by_volume_min: beer.alcohol_by_volume?.minimum?.value || null,
    alcohol_by_volume_max: beer.alcohol_by_volume?.maximum?.value || null,
    color_min: beer.color?.minimum?.value || null,
    color_max: beer.color?.maximum?.value || null,
    ingredients: beer.ingredients,
    examples: beer.examples,
    style_guide: beer.style_guide,
  })
})

fs.writeFileSync(
  path.join(__dirname, '..', 'beerCategories.json'),
  JSON.stringify(categories, null, 2)
)
fs.writeFileSync(
  path.join(__dirname, '..', 'beerStyles.json'),
  JSON.stringify(beerStyles, null, 2)
)
