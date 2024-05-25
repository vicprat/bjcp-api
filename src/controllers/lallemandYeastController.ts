import puppeteer from 'puppeteer'
import express from 'express'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { YeastData, YeastUrl } from '../@types/global'
import {
  LALLEMAND_YEAST_BASE_URL,
  LALLEMAND_YEAST_SPECIFIC_URLS,
} from '../constants'

export const scrapeYeastData = async (
  req: express.Request,
  res: express.Response
) => {
  console.log('Scraping started')
  let browser = null

  try {
    const response = await axios.get(LALLEMAND_YEAST_BASE_URL)
    const htmlContent = response.data
    const urlRegex =
      /https:\/\/www\.lallemandbrewing\.com\/en\/global\/products\/[a-zA-Z0-9-]+/g
    const urlMatches = htmlContent.match(urlRegex)
    const urls = Array.from(new Set(urlMatches)).filter(
      (url): url is string => typeof url === 'string'
    )

    const filteredUrls = LALLEMAND_YEAST_SPECIFIC_URLS.filter((obj: YeastUrl) =>
      urls.includes(obj.url)
    )

    console.log(`Extracted URLs: ${filteredUrls.length} found`)

    browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const results: YeastData[] = []

    for (const { name, url } of filteredUrls) {
      console.log(`Navigating to ${url}`)

      await page.goto(url, { waitUntil: 'networkidle2' })

      const data: YeastData = await page.evaluate((yeastName) => {
        const getTextContent = (selector: string): string => {
          const element = document.querySelector(selector)
          return element && element.textContent
            ? element.textContent.trim()
            : ''
        }

        const brand = 'Lallemand Brewing'
        const yeast_name = yeastName
        const yeast_id = getTextContent('h1.mb-1')

        const yeast_description = (() => {
          const pElements = document.querySelectorAll(
            'div.col-12.col-lg-7.py-lg-100.mt-4.mt-lg-0 p'
          )
          let description = ''
          pElements.forEach((p) => {
            description += (p.textContent ? p.textContent.trim() : '') + ' '
          })
          return description.trim()
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
            if (
              th.textContent &&
              th.textContent.includes('Temperature range')
            ) {
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
            if (
              th.textContent &&
              th.textContent.includes('Alcohol tolerance')
            ) {
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
        } as YeastData
      }, name)

      console.log('Data extracted:', data)
      results.push(data)
    }

    await browser.close()
    console.log('Browser closed')

    // Save results to a JSON file
    const dataPath = path.join(__dirname, '../data/lallemandYeast.json')
    fs.writeFileSync(dataPath, JSON.stringify(results, null, 2), 'utf-8')
    console.log(`Data saved to ${dataPath}`)

    res.status(200).json(results)
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

export default scrapeYeastData
