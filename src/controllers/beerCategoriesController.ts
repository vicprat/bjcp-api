import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import express from 'express'
import { BeerCategory } from '../@types/global'

export const scrapeBeerCategories = async (
  req: express.Request,
  res: express.Response
) => {
  async function fetchBeerCategoryLinks(): Promise<
    { version: string; url: string }[]
  > {
    const url = 'https://www.bjcp.org/beer-styles/beer-style-guidelines/'
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)

    console.log('Fetching beer category links...')
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('.entry-content a'))
      return anchors
        .map((anchor) => (anchor as HTMLAnchorElement).href)
        .filter((href) =>
          href.match(/https:\/\/www\.bjcp\.org\/style\/\d{4}\/\d+\/[^/]+\/$/)
        )
    })

    await browser.close()

    console.log(`Fetched ${links.length} category links`)
    return links
      .map((link) => {
        const match = link.match(/\/style\/(\d{4})\/(\d+)\/[^/]+\/$/)
        if (match) {
          return { version: match[1], url: link }
        }
        return null
      })
      .filter(Boolean) as { version: string; url: string }[]
  }

  async function fetchBeerCategoryData(
    url: string,
    version: string,
    retries = 3
  ): Promise<BeerCategory | null> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await page.goto(url, { timeout: 60000 })
        console.log(`Fetching data for category: ${url}...`)
        const data = await page.evaluate(() => {
          const getTextContent = (selector: string): string => {
            const element = document.querySelector(selector)
            return element ? element.textContent?.trim() || '' : ''
          }

          const titleText =
            document
              .querySelector('header.entry-header h1.entry-title')
              ?.textContent?.trim() || ''
          const categoryMatch = titleText.match(/^(\d+)\.\s+(.+)$/)

          return {
            style_guide:
              document.location.href.match(/\/style\/(\d{4})\//)?.[1] || '',
            category: categoryMatch ? categoryMatch[2] : '',
            category_id: categoryMatch ? categoryMatch[1] : '',
            category_description: getTextContent('.entry-content p'),
          }
        })

        await browser.close()

        if (!data.category) {
          console.warn(`No data found for category: ${url}`)
          return null
        }

        console.log(`Fetched data for category: ${data.category} from ${url}`)
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
    const failedUrls: { version: string; url: string; reason: string }[] = []
    const beerCategories: { [key: string]: BeerCategory[] } = {}

    try {
      console.log('Starting beer category scraper...')
      const categoryLinks = await fetchBeerCategoryLinks()

      for (const { version, url } of categoryLinks) {
        if (!beerCategories[version]) {
          beerCategories[version] = []
        }
        try {
          const beerCategoryData = await fetchBeerCategoryData(url, version)
          if (beerCategoryData) {
            beerCategories[version].push(beerCategoryData)
          } else {
            failedUrls.push({ version, url, reason: 'Data not found' })
            console.warn(`Skipping category at ${url} due to data not found.`)
          }
        } catch (error) {
          if (error instanceof Error) {
            failedUrls.push({ version, url, reason: error.message })
            console.warn(
              `Skipping category at ${url} due to error: ${error.message}`
            )
          } else {
            failedUrls.push({ version, url, reason: 'Unknown error' })
            console.warn(`Skipping category at ${url} due to unknown error.`)
          }
        }
      }

      for (const version of Object.keys(beerCategories)) {
        const jsonData = JSON.stringify(beerCategories[version], null, 2)
        const filePath = path.join(dataDir, `${version}beerCategories.json`)
        fs.writeFileSync(filePath, jsonData)
        console.log(
          `Successfully wrote ${beerCategories[version].length} beer categories for version ${version} to ${filePath}`
        )
      }

      if (failedUrls.length > 0) {
        console.log('Some URLs could not be processed:')
        failedUrls.forEach(({ version, url, reason }) => {
          console.log(`Version: ${version}, URL: ${url}, Reason: ${reason}`)
        })
      }

      console.log('Data fetched and saved successfully.')
      res
        .status(200)
        .json({ message: 'Data fetched and saved successfully.', failedUrls })
    } catch (error) {
      console.error('An error occurred during the main process:', error)
      for (const version of Object.keys(beerCategories)) {
        const jsonData = JSON.stringify(beerCategories[version], null, 2)
        const filePath = path.join(dataDir, `${version}beerCategories.json`)
        fs.writeFileSync(filePath, jsonData)
        console.log(
          `Successfully wrote ${beerCategories[version].length} beer categories for version ${version} to ${filePath}`
        )
      }
      res
        .status(500)
        .json({ message: 'An error occurred during the main process.', error })
    }
  }

  await main()
}
