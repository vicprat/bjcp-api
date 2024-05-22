import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const categoriesData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, './data', 'beerCategories.json'),
    'utf-8'
  )
)
const beerStylesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, './data', 'beerStyles.json'), 'utf-8')
)

async function main() {
  const categoryMap: { [key: string]: number } = {}
  for (const category of categoriesData) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.category,
        description: category.category_description,
      },
    })
    categoryMap[category.category_id] = createdCategory.id
  }

  for (const beerStyle of beerStylesData) {
    const category_id = categoryMap[beerStyle.category_id]
    if (!category_id) {
      console.error(
        `Category id ${beerStyle.category_id} not found for beer style ${beerStyle.name}`
      )
      continue
    }

    await prisma.beerStyle.create({
      data: {
        name: beerStyle.name || '',
        category: { connect: { id: category_id } },
        style_id: beerStyle.style_id || '',
        overall_impression: beerStyle.overall_impression || '',
        aroma: beerStyle.aroma || '',
        appearance: beerStyle.appearance || '',
        flavor: beerStyle.flavor || '',
        mouthfeel: beerStyle.mouthfeel || '',
        comments: beerStyle.comments || '',
        history: beerStyle.history || '',
        style_comparison: beerStyle.style_comparison || '',
        tags: beerStyle.tags || '',
        original_gravity_min: beerStyle.original_gravity_min || 0,
        original_gravity_max: beerStyle.original_gravity_max || 0,
        international_bitterness_units_min:
          beerStyle.international_bitterness_units_min || 0,
        international_bitterness_units_max:
          beerStyle.international_bitterness_units_max || 0,
        final_gravity_min: beerStyle.final_gravity_min || 0,
        final_gravity_max: beerStyle.final_gravity_max || 0,
        alcohol_by_volume_min: beerStyle.alcohol_by_volume_min || 0,
        alcohol_by_volume_max: beerStyle.alcohol_by_volume_max || 0,
        color_min: beerStyle.color_min || 0,
        color_max: beerStyle.color_max || 0,
        ingredients: beerStyle.ingredients || '',
        examples: beerStyle.examples || '',
        style_guide: beerStyle.style_guide || '',
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
