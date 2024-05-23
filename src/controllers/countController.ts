import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export const count = (req: Request, res: Response) => {
  try {
    const categoriesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../data', 'beerCategories.json'),
        'utf-8'
      )
    )

    const beerStylesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../data', 'beerStyles.json'),
        'utf-8'
      )
    )

    const categoriesCount = categoriesData.length
    const stylesCount = beerStylesData.length

    res.status(200).json({ categoriesCount, stylesCount })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(`Error al contar: ${error.message}`)
    } else {
      res.status(500).send('Error desconocido al contar')
    }
  }
}
