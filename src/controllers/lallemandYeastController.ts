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
  async function fetchYeastLinks(): Promise<YeastUrl[]> {
    const response = await axios.get(LALLEMAND_YEAST_BASE_URL)
    const htmlContent = response.data
    const urlRegex =
      /https:\/\/www\.lallemandbrewing\.com\/en\/global\/products\/[a-zA-Z0-9-]+/g
    const urlMatches = htmlContent.match(urlRegex)
    const urls = Array.from(new Set(urlMatches)).filter(
      (url): url is string => typeof url === 'string'
    )

    return LALLEMAND_YEAST_SPECIFIC_URLS.filter((obj: YeastUrl) =>
      urls.includes(obj.url)
    )
  }

  async function fetchYeastData(
    url: string,
    yeastName: string,
    retries = 3
  ): Promise<YeastData | null> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await page.goto(url, { timeout: 60000 })
        console.log(`Fetching data for yeast: ${url}...`)
        const data = await page.evaluate((yeastName) => {
          const getTextContent = (selector: string): string => {
            const element = document.querySelector(selector)
            return element ? element.textContent?.trim() || '' : ''
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
        }, yeastName)

        await browser.close()

        if (!data.yeast_name) {
          console.warn(`No data found for yeast: ${url}`)
          return null
        }

        console.log(`Fetched data for yeast: ${data.yeast_name} from ${url}`)
        return data
      } catch (error) {
        if (error instanceof Error) {
          console.warn(
            `Attempt ${attempt + 1} - Failed to navigate to ${url}: ${
              error.message
            }`
          )
        } else {
          console.warn(
            `Attempt ${
              attempt + 1
            } - Failed to navigate to ${url}: Unknown error`
          )
        }

        if (attempt === retries - 1) {
          await browser.close()
          return null
        }
      }
    }

    await browser.close()
    return null
  }

  const dataDir = path.resolve(__dirname, '../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  async function main() {
    const failedUrls: { url: string; reason: string }[] = []
    const yeastDataList: YeastData[] = []

    try {
      console.log('Starting yeast data scraper...')
      const yeastLinks = await fetchYeastLinks()

      for (const { name, url } of yeastLinks) {
        try {
          const yeastData = await fetchYeastData(url, name)
          if (yeastData) {
            yeastDataList.push(yeastData)
          } else {
            failedUrls.push({ url, reason: 'Data not found' })
            console.warn(`Skipping yeast at ${url} due to data not found.`)
          }
        } catch (error) {
          if (error instanceof Error) {
            failedUrls.push({ url, reason: error.message })
            console.warn(
              `Skipping yeast at ${url} due to error: ${error.message}`
            )
          } else {
            failedUrls.push({ url, reason: 'Unknown error' })
            console.warn(`Skipping yeast at ${url} due to unknown error.`)
          }
        }
      }

      const jsonData = JSON.stringify(yeastDataList, null, 2)
      const filePath = path.join(dataDir, 'lallemandYeast.json')
      fs.writeFileSync(filePath, jsonData)
      console.log(
        `Successfully wrote ${yeastDataList.length} yeast data to ${filePath}`
      )

      if (failedUrls.length > 0) {
        console.log('Some URLs could not be processed:')
        failedUrls.forEach(({ url, reason }) => {
          console.log(`URL: ${url}, Reason: ${reason}`)
        })
      }

      console.log('Data fetched and saved successfully.')
      res
        .status(200)
        .json({ message: 'Data fetched and saved successfully.', failedUrls })
    } catch (error) {
      console.error('An error occurred during the main process:', error)
      const jsonData = JSON.stringify(yeastDataList, null, 2)
      const filePath = path.join(dataDir, 'lallemandYeast.json')
      fs.writeFileSync(filePath, jsonData)
      console.log(
        `Successfully wrote ${yeastDataList.length} yeast data to ${filePath}`
      )
      res
        .status(500)
        .json({ message: 'An error occurred during the main process.', error })
    }
  }

  await main()
}
