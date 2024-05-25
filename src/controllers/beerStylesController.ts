import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { BeerStyle } from '../@types/global'
import express from 'express'

export const scrapeBeerStyles = async (
  req: express.Request,
  res: express.Response
) => {
  async function fetchBeerStyleLinks(): Promise<
    { version: string; url: string }[]
  > {
    const url = 'https://www.bjcp.org/beer-styles/beer-style-guidelines/'
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)

    console.log('Fetching beer style links...')
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('.entry-content a'))
      return anchors
        .map((anchor) => (anchor as HTMLAnchorElement).href)
        .filter((href) => href.startsWith('https://www.bjcp.org/style/'))
    })

    await browser.close()

    console.log(`Fetched ${links.length} style links`)
    return links
      .map((link) => {
        const match = link.match(/\/style\/(\d{4})\/(\d+)\/(\d+[A-Za-z])\//)
        if (match) {
          return { version: match[1], url: link }
        }
        return null
      })
      .filter(Boolean) as { version: string; url: string }[]
  }

  async function fetchBeerStyleData(
    url: string,
    version: string,
    retries = 3
  ): Promise<BeerStyle | null> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await page.goto(url, { timeout: 60000 })
        console.log(`Fetching data for style: ${url}...`)
        const data = await page.evaluate((version) => {
          const getTextContent = (selector: string): string => {
            const element = document.querySelector(selector)
            return element ? element.textContent?.trim() || '' : ''
          }

          const getParagraphContent = (selector: string): string => {
            const element = document.querySelector(`${selector} p:not(:empty)`)
            return element ? element.textContent?.trim() || '' : ''
          }

          const getCellText = (label: string): string => {
            const rows = Array.from(
              document.querySelectorAll('.vital-statistics .row')
            )
            const row = rows.find((r) => r.textContent?.includes(label))
            return row
              ? row
                  .querySelector('.cell:nth-child(2) p')
                  ?.textContent?.trim() || ''
              : ''
          }

          const parseRange = (
            range: string
          ): [number | null, number | null] => {
            if (!range) return [null, null]
            const [min, max] = range.split(' - ').map((str) => parseFloat(str))
            return [isNaN(min) ? null : min, isNaN(max) ? null : max]
          }

          const tags = Array.from(
            document.querySelectorAll('.style-attributes a')
          )
            .map((tag) => tag.textContent?.trim())
            .filter((tag): tag is string => Boolean(tag))

          const og = parseRange(getCellText('OG'))
          const ibu = parseRange(getCellText('IBU'))
          const fg = parseRange(getCellText('FG'))
          const abv = parseRange(getCellText('ABV'))
          const srm = parseRange(getCellText('SRM'))

          const titleText =
            document
              .querySelector('header.entry-header h1.entry-title')
              ?.textContent?.trim() || ''
          const categoryMatch = titleText.match(/^(\d+)/)
          const styleMatch = titleText.match(/^(\d+[A-Za-z])/)

          return {
            name: getTextContent('h1.entry-title a'),
            category_id: categoryMatch ? categoryMatch[1] : '',
            style_id: styleMatch ? styleMatch[1] : '',
            overall_impression: getParagraphContent('.overall-impression'),
            appearance: getParagraphContent('.appearance'),
            aroma: getParagraphContent('.aroma'),
            flavor: getParagraphContent('.flavor'),
            mouthfeel: getParagraphContent('.mouthfeel'),
            comments: getParagraphContent('.comments'),
            history: getParagraphContent('.history'),
            style_comparison: getParagraphContent('.style-comparison'),
            tags,
            original_gravity_min: og[0],
            original_gravity_max: og[1],
            international_bitterness_units_min: ibu[0],
            international_bitterness_units_max: ibu[1],
            final_gravity_min: fg[0],
            final_gravity_max: fg[1],
            alcohol_by_volume_min: abv[0],
            alcohol_by_volume_max: abv[1],
            color_min: srm[0],
            color_max: srm[1],
            ingredients: getParagraphContent('.ingredients'),
            examples: getTextContent('.commercial-examples'),
            style_guide: `${version}`,
          }
        }, version)

        await browser.close()

        if (!data.name) {
          console.warn(`No data found for style: ${url}`)
          return null
        }

        console.log(`Fetched data for style: ${data.name} from ${url}`)
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
    const beerStyles: { [key: string]: BeerStyle[] } = {}

    try {
      console.log('Starting beer style scraper...')
      const styleLinks = await fetchBeerStyleLinks()

      for (const { version, url } of styleLinks) {
        if (!beerStyles[version]) {
          beerStyles[version] = []
        }
        try {
          const beerStyleData = await fetchBeerStyleData(url, version)
          if (beerStyleData) {
            beerStyles[version].push(beerStyleData)
          } else {
            failedUrls.push({ version, url, reason: 'Data not found' })
            console.warn(`Skipping style at ${url} due to data not found.`)
          }
        } catch (error) {
          if (error instanceof Error) {
            failedUrls.push({ version, url, reason: error.message })
            console.warn(
              `Skipping style at ${url} due to error: ${error.message}`
            )
          } else {
            failedUrls.push({ version, url, reason: 'Unknown error' })
            console.warn(`Skipping style at ${url} due to unknown error.`)
          }
        }
      }

      for (const version of Object.keys(beerStyles)) {
        const jsonData = JSON.stringify(beerStyles[version], null, 2)
        const filePath = path.join(dataDir, `${version}beerStyles.json`)
        fs.writeFileSync(filePath, jsonData)
        console.log(
          `Successfully wrote ${beerStyles[version].length} beer styles for version ${version} to ${filePath}`
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
      for (const version of Object.keys(beerStyles)) {
        const jsonData = JSON.stringify(beerStyles[version], null, 2)
        const filePath = path.join(dataDir, `${version}beerStyles.json`)
        fs.writeFileSync(filePath, jsonData)
        console.log(
          `Successfully wrote ${beerStyles[version].length} beer styles for version ${version} to ${filePath}`
        )
      }
      res
        .status(500)
        .json({ message: 'An error occurred during the main process.', error })
    }
  }

  await main()
}
