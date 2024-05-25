import puppeteer from 'puppeteer'
import express from 'express'

export const scrapeYeastData = async (
  req: express.Request,
  res: express.Response
) => {
  const url =
    'https://www.lallemandbrewing.com/en/global/products/lalbrew-koln-kolsch-style-ale-yeast'

  console.log('Scraping started')

  let browser = null

  try {
    browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    console.log('Browser launched and new page opened')

    await page.goto(url, { waitUntil: 'networkidle2' })

    console.log(`Navigated to ${url}`)

    const data = await page.evaluate(() => {
      const getTextContent = (selector: string): string => {
        const element = document.querySelector(selector)
        return element && element.textContent ? element.textContent.trim() : ''
      }

      const brand = 'Lallemand Brewing'
      const yeast_name = 'Kölsch-Style Ale Yeast'
      const yeast_id = getTextContent('h1.mb-1')

      const yeast_description = (() => {
        const h1Element = document.querySelector('h1.mb-1')
        if (h1Element) {
          const nextDiv = h1Element.nextElementSibling
          if (nextDiv) {
            const pElement = nextDiv.querySelector('p') // Get the p within the div
            return pElement && pElement.textContent
              ? pElement.textContent.trim()
              : ''
          }
        }
        return ''
      })()
      const yeast_strain = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Strain')) {
            const td = th.nextElementSibling
            const em = td?.querySelector('em')
            return em && em.textContent ? em.textContent.trim() : ''
          }
        }
        return ''
      })()

      const beer_styles_text = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Beer styles')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()
      const beer_styles = beer_styles_text
        ? beer_styles_text.split(',').map((style: string) => style.trim())
        : []

      const attenuation_range_text = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Attenuation')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()
      const attenuation_range = attenuation_range_text
        ? attenuation_range_text.split('-').map(Number)
        : [0, 0]
      const attenuation_min = attenuation_range[0]
      const attenuation_max = attenuation_range[1]

      const temp_range_text = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Temperature range')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()
      const temp_range = temp_range_text
        ? temp_range_text.match(/(\d+)\s*-\s*(\d+)/)
        : null
      const fermentation_temperature_range_min = temp_range
        ? parseInt(temp_range[1])
        : 0
      const fermentation_temperature_range_max = temp_range
        ? parseInt(temp_range[2])
        : 0

      const floculation = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Flocculation')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()

      const aroma = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Aroma')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()

      const abv_text = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Alcohol tolerance')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()
      const abv_alcohol_tolerance = abv_text
        ? parseInt(abv_text.match(/\d+/)?.[0] || '0')
        : 0

      const pitching_rate = (() => {
        const thElements = Array.from(document.querySelectorAll('th'))
        for (const th of thElements) {
          if (th.textContent && th.textContent.includes('Pitching rate')) {
            const td = th.nextElementSibling
            return td && td.textContent ? td.textContent.trim() : ''
          }
        }
        return ''
      })()

      return {
        brand,
        yeast_name,
        yeast_id,
        yeast_description,
        yeast_strain,
        beer_styles,
        attenuation_min,
        attenuation_max,
        fermentation_temperature_range_min,
        fermentation_temperature_range_max,
        floculation,
        aroma,
        abv_alcohol_tolerance,
        pitching_rate,
      }
    })

    console.log('Data extracted:', data)

    await browser.close()
    console.log('Browser closed')

    res.status(200).json(data)
  } catch (error) {
    if (browser) {
      await browser.close()
      console.log('Browser closed due to error')
    }
    console.error('Error during scraping:', error)
    res.status(500).json({
      error: 'Error during scraping',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
